const express = require('express');
const { getStats } = require('../controllers/publicController');

const router = express.Router();

// Public endpoint for platform statistics (no authentication required)
router.get('/stats', getStats);

module.exports = router;
