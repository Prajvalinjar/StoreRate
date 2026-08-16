const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getDashboard, addStore, updateStore, postOwnerReply, deleteOwnerReply } = require('../controllers/ownerController');

const router = express.Router();

// Require authentication & STORE_OWNER role for all owner routes
router.use(requireAuth, requireRole('STORE_OWNER'));

router.get('/dashboard', getDashboard);
router.post('/stores', addStore);
router.put('/stores/:id', updateStore);
router.put('/ratings/:ratingId/reply', postOwnerReply);
router.delete('/ratings/:ratingId/reply', deleteOwnerReply);

module.exports = router;
