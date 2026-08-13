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
} = require('../controllers/adminController');

const router = express.Router();

// Require both authentication and ADMIN role for all routes under /api/admin
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.post('/users', addUser);
router.get('/users/:id', getUser);
router.get('/stores', listStores);
router.post('/stores', addStore);
router.get('/stores/:id', getStore);

module.exports = router;
