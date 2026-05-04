const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all services (with thumbnail only for listing)
router.get('/', async (req, res) => {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      category: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(services);
});

// Get single service with all designs sorted by price (highest first)
router.get('/:id', async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      designs: {
        orderBy: { price: 'desc' }, // highest price first
      },
    },
  });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});
// Get all designs for homepage slider
router.get('/designs/all', async (req, res) => {
  const designs = await prisma.serviceDesign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json(designs);
});

module.exports = router;