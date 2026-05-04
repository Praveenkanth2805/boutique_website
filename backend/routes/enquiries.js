const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  '/',
  [
    body('name').notEmpty(),
    body('address').notEmpty(),
    body('pincode').notEmpty(),
    body('mobile').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, address, pincode, mobile, designId } = req.body; // ✅ only designId
    const userId = req.user?.id || null;

    if (!designId) {
      return res.status(400).json({ message: 'designId is required' });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        userId,
        designId: parseInt(designId),
        name,
        address,
        pincode,
        mobile,
      },
    });
    res.status(201).json(enquiry);
  }
);

module.exports = router;