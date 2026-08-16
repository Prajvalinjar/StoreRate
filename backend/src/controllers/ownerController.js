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

const addStore = async (req, res, next) => {
  try {
    const { name, email, address } = req.body;
    if (!name || !email || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and address are required.',
      });
    }

    const newStore = await ownerService.createOwnerStore(req.user.id, { name, email, address });
    return res.status(201).json({
      status: 'success',
      message: 'Store listing submitted for approval.',
      data: { store: newStore },
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
  addStore,
};
