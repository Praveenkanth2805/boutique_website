const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const { processImage } = require('../utils/imageProcessor');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer'); // <-- ADD THIS LINE

const router = express.Router();
const prisma = new PrismaClient();

// Create service
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
    const { name, description, price } = req.body;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image required' });
    }
    const service = await prisma.service.create({
      data: { name, description, price: parseFloat(price) },
    });
    for (let i = 0; i < files.length; i++) {
      const processedUrl = await processImage(files[i].path);
      const isPrimary = i === 0;
      await prisma.serviceImage.create({
        data: { serviceId: service.id, imageUrl: processedUrl, isPrimary },
      });
    }
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ message: 'Failed to create service', error: error.message });
  }
});

// Update service
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
    const { name, description, price, primaryImageId } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description && description.trim()) updateData.description = description.trim();
    if (price !== undefined && price !== null && price !== '') {
      updateData.price = parseFloat(price);
    }

    // Only update if there are fields to change
    if (Object.keys(updateData).length > 0) {
      await prisma.service.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    }

    // Set primary image if requested
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

    // Upload new images
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const processedUrl = await processImage(file.path);
        await prisma.serviceImage.create({
          data: { serviceId: parseInt(id), imageUrl: processedUrl, isPrimary: false },
        });
      }
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
});

// Delete service
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Delete a single service image
router.delete('/services/images/:imageId', adminAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    await prisma.serviceImage.delete({ where: { id: parseInt(imageId) } });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// Get all enquiries
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

// Dashboard stats
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
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(messages);
});

module.exports = router;