const {
  ratingBodySchema,
  storeIdParamSchema,
  userStoreQuerySchema,
} = require('../validators/userStoreValidator');
const userStoreService = require('../services/userStoreService');

const listStores = async (req, res, next) => {
  try {
    const query = userStoreQuerySchema.parse(req.query);
    const result = await userStoreService.getStoresForUser(req.user.id, query);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

const postRating = async (req, res, next) => {
  try {
    const paramResult = storeIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Store ID format',
        errors: paramResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { storeId } = paramResult.data;
    const { rating, review } = ratingBodySchema.parse(req.body);

    const newRating = await userStoreService.submitRating(req.user.id, storeId, rating, review);
    return res.status(201).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: { rating: newRating },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof userStoreService.UserStoreError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const putRating = async (req, res, next) => {
  try {
    const paramResult = storeIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Store ID format',
        errors: paramResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { storeId } = paramResult.data;
    const { rating, review } = ratingBodySchema.parse(req.body);

    const updatedRating = await userStoreService.updateRating(req.user.id, storeId, rating, review);
    return res.status(200).json({
      status: 'success',
      message: 'Rating updated successfully',
      data: { rating: updatedRating },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error instanceof userStoreService.UserStoreError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const listUserRatings = async (req, res, next) => {
  try {
    const result = await userStoreService.getUserRatings(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStores,
  postRating,
  putRating,
  listUserRatings,
};
