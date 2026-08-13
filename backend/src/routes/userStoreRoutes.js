const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listStores, postRating, putRating, listUserRatings } = require('../controllers/userStoreController');

const router = express.Router();

// All store routes for normal users require authentication & USER role
router.use(requireAuth, requireRole('USER'));

router.get('/my-ratings', listUserRatings);
router.get('/', listStores);
router.post('/:storeId/rating', postRating);
router.put('/:storeId/rating', putRating);

module.exports = router;
