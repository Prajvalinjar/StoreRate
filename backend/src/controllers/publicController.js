const publicService = require('../services/publicService');

const getStats = async (req, res, next) => {
  try {
    const stats = await publicService.getPublicStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const listStores = async (req, res, next) => {
  try {
    const { q, category, minRating, rating, sort, page, limit } = req.query;
    const ratingFilter = rating || minRating;
    const result = await publicService.getPublicStores({ q, category, minRating: ratingFilter, sort, page, limit });
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const listTopRatedStores = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const result = await publicService.getTopRatedStores(limit);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await publicService.getPublicStoreById(id);
    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoStores = async (req, res, next) => {
  try {
    const { seed } = require('../scripts/seed');
    const result = await seed();
    return res.status(200).json({
      status: 'success',
      message: 'Production stores seeded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  listStores,
  listTopRatedStores,
  getStoreById,
  seedDemoStores,
};
