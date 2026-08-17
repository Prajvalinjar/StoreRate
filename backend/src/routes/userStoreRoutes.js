const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listStores, postRating, putRating, listUserRatings, getUserDashboard } = require('../controllers/userStoreController');
const { addFavorite, removeFavorite, listFavorites, listFavoriteIds } = require('../controllers/favoriteController');

const router = express.Router();

// All store routes for normal users require authentication & USER role
router.use(requireAuth, requireRole('USER'));

router.get('/dashboard', getUserDashboard);
router.get('/my-ratings', listUserRatings);
router.get('/favorites', listFavorites);
router.get('/favorite-ids', listFavoriteIds);

router.get('/', listStores);
router.post('/:storeId/rating', postRating);
router.put('/:storeId/rating', putRating);

router.post('/:storeId/favorite', addFavorite);
router.delete('/:storeId/favorite', removeFavorite);

module.exports = router;
