const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendEnquiryEmail } = require('../utils/emailService');

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

    const { name, address, pincode, mobile, designId } = req.body;
    const userId = req.user?.id || null;

    if (!designId) {
      return res.status(400).json({ message: 'designId is required' });
    }

    // Save enquiry to database
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

    // Fetch design details for email (including service title and image)
    const design = await prisma.serviceDesign.findUnique({
      where: { id: parseInt(designId) },
      include: { service: true },
    });

    // Send email notification to admin (do not block response if email fails)
    if (design) {
      try {
        await sendEnquiryEmail({
          name,
          mobile,
          address,
          pincode,
          serviceTitle: design.service.title,
          designTitle: `Design #${design.id}`,
          designImageUrl: design.imageUrl,
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
        // Don't return error to user; just log
      }
    }

    res.status(201).json(enquiry);
  }
);

module.exports = router;