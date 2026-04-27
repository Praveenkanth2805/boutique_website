const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { sendContactEmail } = require('../utils/emailService');
const router = express.Router();
const prisma = new PrismaClient();

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      // Save to database
      const contact = await prisma.contactMessage.create({
        data: { name, email, message },
      });

      // Send attractive email to admin
      //await sendContactEmail(name, email, message);
      // In contact.js, replace await sendContactEmail(...) with:
      sendContactEmail(name, email, message).catch(err => console.error('Email error:', err));

      res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
      console.error('Contact error:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  }
);

module.exports = router;