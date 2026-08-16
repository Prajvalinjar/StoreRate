const express = require('express');
const { getStats, listStores, getStoreById } = require('../controllers/publicController');

const router = express.Router();

// Public endpoint for platform statistics (no authentication required)
router.get('/stats', getStats);

// Public endpoints for store discovery & store details (no authentication required)
router.get('/stores', listStores);
router.get('/stores/:id', getStoreById);

router.get('/', getStats);

module.exports = router;
