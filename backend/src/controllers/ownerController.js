const ownerService = require('../services/ownerService');

const getDashboard = async (req, res, next) => {
  try {
    const result = await ownerService.getOwnerDashboard(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error instanceof ownerService.OwnerError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getDashboard,
};
