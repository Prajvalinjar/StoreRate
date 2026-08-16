const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { postReport } = require('../controllers/reviewReportController');

const router = express.Router();

// Require authentication & USER role for reporting reviews
router.post('/:ratingId/report', requireAuth, requireRole('USER'), postReport);

module.exports = router;
