const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all services (with primary image)
router.get('/', async (req, res) => {
  const services = await prisma.service.findMany({
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
  res.json(services);
});

// Get single service with all images
router.get('/:id', async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { images: true },
  });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});

module.exports = router;