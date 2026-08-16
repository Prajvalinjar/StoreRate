const prisma = require('../utils/prisma');

class FavoriteError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'FavoriteError';
    this.statusCode = statusCode;
  }
}

const addFavorite = async (userId, storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store || store.status !== 'APPROVED') {
    throw new FavoriteError('Store not found or unavailable for saving', 404);
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    update: {},
    create: {
      userId,
      storeId,
    },
    include: {
      store: true,
    },
  });

  return favorite;
};

const removeFavorite = async (userId, storeId) => {
  const result = await prisma.favorite.deleteMany({
    where: {
      userId,
      storeId,
    },
  });

  return result;
};

const getUserFavorites = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      store: {
        include: {
          ratings: {
            select: { rating: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => {
    const s = f.store;
    const totalRatings = s.ratings ? s.ratings.length : 0;
    const sum = totalRatings > 0 ? s.ratings.reduce((acc, r) => acc + r.rating, 0) : 0;
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

    return {
      favoriteId: f.id,
      savedAt: f.createdAt,
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      category: s.category,
      imageUrl: s.imageUrl,
      status: s.status,
      averageRating,
      totalRatings,
    };
  });
};

const getUserFavoriteStoreIds = async (userId) => {
  if (!userId) return [];
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { storeId: true },
  });
  return favorites.map((f) => f.storeId);
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getUserFavoriteStoreIds,
  FavoriteError,
};
