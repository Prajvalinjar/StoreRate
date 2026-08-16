const prisma = require('../utils/prisma');

/**
 * Calculates safe platform aggregate statistics for the public landing page.
 * Returns only non-sensitive counts and average ratings.
 */
const getPublicStats = async () => {
  const [businesses, ratings, users, avgResult] = await Promise.all([
    prisma.store.count({
      where: { status: 'APPROVED' },
    }),
    prisma.rating.count({
      where: { store: { status: 'APPROVED' } },
    }),
    prisma.user.count(),
    prisma.rating.aggregate({
      where: { store: { status: 'APPROVED' } },
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
 * Only APPROVED stores are returned publicly.
 */
const getPublicStores = async ({ q, category, minRating, sort = 'recommended', page = 1, limit = 12 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const where = {
    status: 'APPROVED',
  };

  const andConditions = [];

  if (category && category.trim() && category.toLowerCase() !== 'all') {
    andConditions.push({
      category: { equals: category.trim(), mode: 'insensitive' },
    });
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const rawStores = await prisma.store.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      category: true,
      imageUrl: true,
      status: true,
      createdAt: true,
      ratings: {
        select: {
          rating: true,
        },
      },
    },
  });

  let stores = rawStores.map((store) => {
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

  // Minimum Rating Filtering
  if (minRating && !isNaN(Number(minRating))) {
    const minRatingVal = Number(minRating);
    stores = stores.filter((s) => s.averageRating >= minRatingVal);
  }

  // Sorting
  if (sort === 'rating_desc' || sort === 'highest_rated') {
    stores.sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings);
  } else if (sort === 'ratings_count_desc' || sort === 'most_rated') {
    stores.sort((a, b) => b.totalRatings - a.totalRatings || b.averageRating - a.averageRating);
  } else if (sort === 'newest') {
    stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'name_asc') {
    stores.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Recommended default: average rating DESC, tie-breaker name ASC
    stores.sort((a, b) => b.averageRating - a.averageRating || a.name.localeCompare(b.name));
  }

  const total = stores.length;
  const skip = (pageNum - 1) * limitNum;
  const paginatedStores = stores.slice(skip, skip + limitNum);

  return {
    stores: paginatedStores,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getTopRatedStores = async (limit = 6) => {
  const result = await getPublicStores({ sort: 'rating_desc', page: 1, limit });
  return { stores: result.stores };
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
      category: true,
      imageUrl: true,
      status: true,
      rejectionReason: true,
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
  getTopRatedStores,
  getPublicStoreById,
};
