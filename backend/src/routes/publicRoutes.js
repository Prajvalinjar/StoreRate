const express = require('express');
const { getStats, listStores, listTopRatedStores, getStoreById, seedDemoStores } = require('../controllers/publicController');

const router = express.Router();

// Public endpoint for platform statistics (no authentication required)
router.get('/stats', getStats);

// Idempotent seeding route for production environment initialization
router.post('/seed-demo', seedDemoStores);

// Public endpoints for store discovery & store details (no authentication required)
router.get('/stores', listStores);
router.get('/stores/top-rated', listTopRatedStores);
router.get('/stores/:id', getStoreById);

router.get('/', getStats);

module.exports = router;
