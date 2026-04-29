require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const enquiryRoutes = require('./routes/enquiries');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Optional: serve static uploaded files (if you still use local disk – but you switched to Supabase)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (to avoid 404 on root and help Render)
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Test DB connection on startup (log only)
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(e => console.error('❌ Database connection failed:', e));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});