const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'service-images';

async function uploadToSupabase(buffer, originalName) {
  const webpBuffer = await sharp(buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, webpBuffer, {
    contentType: 'image/webp',
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return publicUrl;
}

// ========== CREATE SERVICE (with thumbnail + designs) ==========
router.post('/services', adminAuth, (req, res, next) => {
  // Accept both thumbnail and designImages
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'designImages', maxCount: 20 }
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') return res.status(413).json({ message: 'File too large' });
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, category, designs } = req.body;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
    const designFiles = req.files['designImages'] || [];
    const designsData = JSON.parse(designs);

    if (!thumbnailFile) {
      return res.status(400).json({ message: 'Thumbnail image is required' });
    }
    if (designFiles.length === 0 || designFiles.length !== designsData.length) {
      return res.status(400).json({ message: 'Number of design images must match number of designs' });
    }

    // Upload thumbnail
    const thumbnailUrl = await uploadToSupabase(thumbnailFile.buffer, thumbnailFile.originalname);

    const service = await prisma.service.create({
      data: {
        title,
        description: description || null,
        thumbnail: thumbnailUrl,
        category: category || 'uncategorized',
      },
    });

    // Upload each design image and create design records
    for (let i = 0; i < designFiles.length; i++) {
      const imageUrl = await uploadToSupabase(designFiles[i].buffer, designFiles[i].originalname);
      await prisma.serviceDesign.create({
        data: {
          serviceId: service.id,
          imageUrl,
          price: parseFloat(designsData[i].price),
          description: designsData[i].description || null,
        },
      });
    }

    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// ========== UPDATE SERVICE (thumbnail + designs management) ==========
router.put('/services/:id', adminAuth, (req, res, next) => {
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'newDesignImages', maxCount: 20 }
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') return res.status(413).json({ message: 'File too large' });
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, existingDesigns, deletedDesignIds, newDesigns } = req.body;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    // Update service metadata
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (category) updateData.category = category;
    if (thumbnailFile) {
      const newThumbnailUrl = await uploadToSupabase(thumbnailFile.buffer, thumbnailFile.originalname);
      updateData.thumbnail = newThumbnailUrl;
    }
    if (Object.keys(updateData).length) {
      await prisma.service.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    }

    // Delete removed designs
    if (deletedDesignIds) {
      const ids = JSON.parse(deletedDesignIds);
      for (const designId of ids) {
        const d = await prisma.serviceDesign.findUnique({ where: { id: parseInt(designId) } });
        if (d) {
          const fileName = d.imageUrl.split('/').pop();
          await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
          await prisma.serviceDesign.delete({ where: { id: parseInt(designId) } });
        }
      }
    }

    // Update existing designs (price, description)
    if (existingDesigns) {
      const updates = JSON.parse(existingDesigns);
      for (const upd of updates) {
        await prisma.serviceDesign.update({
          where: { id: parseInt(upd.id) },
          data: {
            price: parseFloat(upd.price),
            description: upd.description || null,
          },
        });
      }
    }

    // Add new designs with images
    if (req.files['newDesignImages'] && req.files['newDesignImages'].length) {
      const newDesignFiles = req.files['newDesignImages'];
      const newDesignsData = JSON.parse(newDesigns || '[]');
      for (let i = 0; i < newDesignFiles.length; i++) {
        const imageUrl = await uploadToSupabase(newDesignFiles[i].buffer, newDesignFiles[i].originalname);
        await prisma.serviceDesign.create({
          data: {
            serviceId: parseInt(id),
            imageUrl,
            price: parseFloat(newDesignsData[i]?.price || 0),
            description: newDesignsData[i]?.description || null,
          },
        });
      }
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// DELETE SERVICE (and all its designs) – unchanged
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    const designs = await prisma.serviceDesign.findMany({ where: { serviceId: parseInt(req.params.id) } });
    for (const d of designs) {
      const fileName = d.imageUrl.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
    }
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// DELETE single design
router.delete('/designs/:designId', adminAuth, async (req, res) => {
  try {
    const design = await prisma.serviceDesign.findUnique({ where: { id: parseInt(req.params.designId) } });
    if (design) {
      const fileName = design.imageUrl.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
      await prisma.serviceDesign.delete({ where: { id: parseInt(req.params.designId) } });
    }
    res.json({ message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ========== EXISTING ROUTES (enquiries, stats, contact) – unchanged ==========
router.get('/enquiries', adminAuth, async (req, res) => {
  const enquiries = await prisma.enquiry.findMany({
     include: {
       user: true,
       design: {
          include: {
            service: true 
           }
          }
        },
      orderBy: { createdAt: 'desc' } 
    });
  res.json(enquiries);
});

router.get('/stats', adminAuth, async (req, res) => {
  const totalServices = await prisma.service.count();
  const totalEnquiries = await prisma.enquiry.count();
  const totalUsers = await prisma.user.count();
  res.json({ totalServices, totalEnquiries, totalUsers });
});

router.get('/contact', adminAuth, async (req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(messages);
});

module.exports = router;