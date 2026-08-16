const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userStoreRoutes = require('./routes/userStoreRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const publicRoutes = require('./routes/publicRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Store Rating Platform Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

// Public statistics routes (no auth required)
app.use('/api/public', publicRoutes);
app.use('/api/stats', publicRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Normal User Store & Rating routes
app.use('/api/stores', userStoreRoutes);

// Review Reporting routes
app.use('/api/reviews', reviewRoutes);

// Store Owner routes
app.use('/api/owner', ownerRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
