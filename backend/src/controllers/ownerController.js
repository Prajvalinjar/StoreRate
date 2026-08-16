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
    const { name, email, address, category, city, phone, description, imageUrl } = req.body;
    if (!name || !email || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and address are required.',
      });
    }

    const newStore = await ownerService.createOwnerStore(req.user.id, {
      name,
      email,
      address,
      category,
      city,
      phone,
      description,
      imageUrl,
    });
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

const updateStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedStore = await ownerService.updateOwnerStore(req.user.id, id, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Store listing details updated successfully.',
      data: { store: updatedStore },
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

const postOwnerReply = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reply text is required',
      });
    }

    const updatedRating = await ownerService.replyToRating(req.user.id, ratingId, reply);
    return res.status(200).json({
      status: 'success',
      message: 'Owner response saved successfully',
      data: { rating: updatedRating },
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

const deleteOwnerReply = async (req, res, next) => {
  try {
    const { ratingId } = req.params;

    const updatedRating = await ownerService.deleteReplyFromRating(req.user.id, ratingId);
    return res.status(200).json({
      status: 'success',
      message: 'Owner response deleted successfully',
      data: { rating: updatedRating },
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
  updateStore,
  postOwnerReply,
  deleteOwnerReply,
};
