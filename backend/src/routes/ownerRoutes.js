const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getDashboard } = require('../controllers/ownerController');

const router = express.Router();

// Require authentication & STORE_OWNER role for all owner routes
router.use(requireAuth, requireRole('STORE_OWNER'));

router.get('/dashboard', getDashboard);

module.exports = router;
