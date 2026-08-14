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

module.exports = {
  getStats,
};
