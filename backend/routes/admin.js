const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const router = express.Router();
const prisma = new PrismaClient();

// ========== SUPABASE SETUP ==========
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'service-images';

// Helper: upload image buffer to Supabase Storage, return public URL
async function uploadToSupabase(buffer, originalName) {
  const webpBuffer = await sharp(buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const fileName = `${timestamp}-${random}.webp`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  return publicUrl;
}

// ========== CREATE SERVICE (with per‑image price/description) ==========
router.post('/services', adminAuth, (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(413).json({ message: 'File too large. Max size 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    // imagesDetails is a JSON string: [{ price, description }, ...]
    const imagesDetails = req.body.imagesDetails ? JSON.parse(req.body.imagesDetails) : [];
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image required' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        category: category || 'Uncategorized'
      },
    });

    for (let i = 0; i < files.length; i++) {
      const publicUrl = await uploadToSupabase(files[i].buffer, files[i].originalname);
      const isPrimary = i === 0;
      const detail = imagesDetails[i] || {};
      await prisma.serviceImage.create({
        data: {
          serviceId: service.id,
          imageUrl: publicUrl,
          isPrimary,
          price: detail.price ? parseFloat(detail.price) : null,
          description: detail.description || null,
        },
      });
    }
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ message: 'Failed to create service', error: error.message });
  }
});

// ========== UPDATE SERVICE (with per‑image price/description) ==========
router.put('/services/:id', adminAuth, (req, res, next) => {
  upload.array('newImages', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(413).json({ message: 'File too large. Max size 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imagesDetails, deletedImageIds, primaryImageId } = req.body;

    // 1. Update main service fields
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description && description.trim()) updateData.description = description.trim();
    if (price !== undefined && price !== null && price !== '') updateData.price = parseFloat(price);
    if (category && category.trim()) updateData.category = category.trim();
    if (Object.keys(updateData).length > 0) {
      await prisma.service.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    }

    // 2. Delete removed images
    if (deletedImageIds) {
      const idsToDelete = JSON.parse(deletedImageIds);
      for (const imageId of idsToDelete) {
        const img = await prisma.serviceImage.findUnique({ where: { id: parseInt(imageId) } });
        if (img) {
          const fileName = img.imageUrl.split('/').pop();
          await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
          await prisma.serviceImage.delete({ where: { id: parseInt(imageId) } });
        }
      }
    }

    // 3. Update existing images (price, description, isPrimary)
    if (imagesDetails) {
      const updates = JSON.parse(imagesDetails);
      for (const upd of updates) {
        await prisma.serviceImage.update({
          where: { id: parseInt(upd.id) },
          data: {
            price: upd.price ? parseFloat(upd.price) : null,
            description: upd.description || null,
            isPrimary: upd.isPrimary || false,
          },
        });
      }
    }

    // 4. Set primary image if explicitly provided (overrides above)
    if (primaryImageId) {
      await prisma.serviceImage.updateMany({
        where: { serviceId: parseInt(id) },
        data: { isPrimary: false },
      });
      await prisma.serviceImage.update({
        where: { id: parseInt(primaryImageId) },
        data: { isPrimary: true },
      });
    }

    // 5. Upload new images with their own price/description
    if (req.files && req.files.length) {
      const newImagesDetails = req.body.newImagesDetails ? JSON.parse(req.body.newImagesDetails) : [];
      for (let i = 0; i < req.files.length; i++) {
        const publicUrl = await uploadToSupabase(req.files[i].buffer, req.files[i].originalname);
        const detail = newImagesDetails[i] || {};
        await prisma.serviceImage.create({
          data: {
            serviceId: parseInt(id),
            imageUrl: publicUrl,
            isPrimary: false,
            price: detail.price ? parseFloat(detail.price) : null,
            description: detail.description || null,
          },
        });
      }
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
});

// ========== DELETE SERVICE ==========
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    const images = await prisma.serviceImage.findMany({
      where: { serviceId: parseInt(req.params.id) },
    });
    for (const img of images) {
      const fileName = img.imageUrl.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
    }
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ========== DELETE SINGLE IMAGE ==========
router.delete('/services/images/:imageId', adminAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await prisma.serviceImage.findUnique({ where: { id: parseInt(imageId) } });
    if (image) {
      const fileName = image.imageUrl.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
    }
    await prisma.serviceImage.delete({ where: { id: parseInt(imageId) } });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// ========== EXISTING ROUTES ==========
router.get('/enquiries', adminAuth, async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      include: { user: true, service: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enquiries' });
  }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalServices = await prisma.service.count();
    const totalEnquiries = await prisma.enquiry.count();
    const totalUsers = await prisma.user.count();
    res.json({ totalServices, totalEnquiries, totalUsers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

router.get('/contact', adminAuth, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contact messages' });
  }
});

module.exports = router;