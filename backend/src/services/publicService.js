const prisma = require('../utils/prisma');

/**
 * Calculates safe platform aggregate statistics for the public landing page.
 * Returns only non-sensitive counts and average ratings.
 */
const getPublicStats = async () => {
  const [businesses, ratings, users, avgResult] = await Promise.all([
    prisma.store.count(),
    prisma.rating.count(),
    prisma.user.count(),
    prisma.rating.aggregate({
      _avg: { rating: true },
    }),
  ]);

  const rawAvg = avgResult?._avg?.rating;
  const averageRating =
    rawAvg !== null && rawAvg !== undefined && !isNaN(rawAvg)
      ? Number(rawAvg.toFixed(1))
      : 0.0;

  return {
    businesses: businesses || 0,
    ratings: ratings || 0,
    users: users || 0,
    averageRating: averageRating || 0.0,
  };
};

/**
 * Retrieves public store listings with optional search (q) and pagination.
 */
const getPublicStores = async ({ q, page = 1, limit = 12 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (q && q.trim()) {
    const searchTerm = q.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { address: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const [total, rawStores] = await Promise.all([
    prisma.store.count({ where }),
    prisma.store.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    }),
  ]);

  const stores = rawStores.map((store) => {
    const totalRatings = store.ratings.length;
    const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;
    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating,
      totalRatings,
      ratingCount: totalRatings,
    };
  });

  return {
    stores,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Retrieves single public store detail by ID.
 */
const getPublicStoreById = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      createdAt: true,
      ratings: {
        select: {
          id: true,
          rating: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!store) {
    return null;
  }

  const totalRatings = store.ratings.length;
  const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0.0;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  store.ratings.forEach((r) => {
    if (counts[r.rating] !== undefined) {
      counts[r.rating]++;
    }
  });

  const distribution = {};
  [5, 4, 3, 2, 1].forEach((star) => {
    const count = counts[star];
    const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
    distribution[star] = { count, percentage };
  });

  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating,
    totalRatings,
    ratingCount: totalRatings,
    stats: {
      averageRating,
      totalRatings,
      ratingCount: totalRatings,
    },
    distribution,
    recentRatings: ratings.slice(0, 20),
    ratings: ratings.slice(0, 20),
  };
};

module.exports = {
  getPublicStats,
  getPublicStores,
  getPublicStoreById,
};
