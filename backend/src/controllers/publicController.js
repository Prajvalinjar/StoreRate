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
    const { q, page, limit } = req.query;
    const result = await publicService.getPublicStores({ q, page, limit });
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

module.exports = {
  getStats,
  listStores,
  getStoreById,
};
