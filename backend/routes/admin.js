const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const { processImage } = require('../utils/imageProcessor');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create service
router.post('/services', adminAuth, upload.array('images', 10), async (req, res) => {
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
router.put('/services/:id', adminAuth, upload.array('newImages', 10), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, primaryImageId } = req.body;

  await prisma.service.update({
    where: { id: parseInt(id) },
    data: { name, description, price: parseFloat(price) },
  });

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

  if (req.files && req.files.length) {
    for (const file of req.files) {
      const processedUrl = await processImage(file.path);
      await prisma.serviceImage.create({
        data: { serviceId: parseInt(id), imageUrl: processedUrl, isPrimary: false },
      });
    }
  }

  res.json({ message: 'Service updated' });
});

// Delete service
router.delete('/services/:id', adminAuth, async (req, res) => {
  await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Service deleted' });
});

// Get all enquiries
router.get('/enquiries', adminAuth, async (req, res) => {
  const enquiries = await prisma.enquiry.findMany({
    include: { user: true, service: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(enquiries);
});

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  const totalServices = await prisma.service.count();
  const totalEnquiries = await prisma.enquiry.count();
  const totalUsers = await prisma.user.count();
  res.json({ totalServices, totalEnquiries, totalUsers });
});

module.exports = router;