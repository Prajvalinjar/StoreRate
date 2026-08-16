const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getDashboard,
  listUsers,
  getUser,
  addUser,
  listStores,
  getStore,
  addStore,
  listPendingStores,
  approveStore,
  rejectStore,
  listReviewReports,
  dismissReviewReport,
  hideReportedReview,
  restoreReportedReview,
} = require('../controllers/adminController');

const router = express.Router();

// Require both authentication and ADMIN role for all routes under /api/admin
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.post('/users', addUser);
router.get('/users/:id', getUser);

// Store Approval Workflow & Management Routes
router.get('/stores/pending', listPendingStores);
router.put('/stores/:id/approve', approveStore);
router.put('/stores/:id/reject', rejectStore);
router.get('/stores', listStores);
router.post('/stores', addStore);
router.get('/stores/:id', getStore);

// Review Moderation Routes
router.get('/review-reports', listReviewReports);
router.put('/review-reports/:id/dismiss', dismissReviewReport);
router.put('/review-reports/:id/hide', hideReportedReview);
router.put('/review-reports/:id/restore', restoreReportedReview);

module.exports = router;
