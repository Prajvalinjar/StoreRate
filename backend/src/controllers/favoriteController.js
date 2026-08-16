const favoriteService = require('../services/favoriteService');

const addFavorite = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const favorite = await favoriteService.addFavorite(req.user.id, storeId);
    return res.status(201).json({
      status: 'success',
      message: 'Store added to saved favorites',
      data: { favorite },
    });
  } catch (error) {
    if (error instanceof favoriteService.FavoriteError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    await favoriteService.removeFavorite(req.user.id, storeId);
    return res.status(200).json({
      status: 'success',
      message: 'Store removed from saved favorites',
    });
  } catch (error) {
    next(error);
  }
};

const listFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
};

const listFavoriteIds = async (req, res, next) => {
  try {
    const favoriteStoreIds = await favoriteService.getUserFavoriteStoreIds(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: { favoriteStoreIds },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
  listFavoriteIds,
};
