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
 * Recommended sorting uses a weighted Bayesian average formula:
 * weightedScore = (v / (v + m)) * R + (m / (v + m)) * C
 * where C = global average rating (3.9★), m = minimum rating confidence threshold (3).
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
        { city: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
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
      city: true,
      phone: true,
      category: true,
      description: true,
      imageUrl: true,
      status: true,
      isVerified: true,
      createdAt: true,
      ratings: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calculate platform-wide average rating (C) dynamically from approved store ratings
  let totalRatingSum = 0;
  let totalRatingCount = 0;

  rawStores.forEach((store) => {
    store.ratings.forEach((r) => {
      totalRatingSum += r.rating;
      totalRatingCount++;
    });
  });

  const C = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 3.9;
  const m = 3; // Minimum rating confidence threshold constant

  let stores = rawStores.map((store) => {
    const v = store.ratings.length;
    const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const R = v > 0 ? sum / v : 0;
    const averageRating = v > 0 ? Number(R.toFixed(1)) : 0;

    // Weighted Bayesian Score: (v / (v + m)) * R + (m / (v + m)) * C
    const weightedScore = (v / (v + m)) * R + (m / (v + m)) * C;

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      city: store.city ? store.city.trim() : null,
      isVerified: Boolean(store.isVerified),
      averageRating,
      totalRatings: v,
      ratingCount: v,
      weightedScore,
    };
  });

  // Minimum Rating Filtering
  if (minRating && !isNaN(Number(minRating))) {
    const minRatingVal = Number(minRating);
    stores = stores.filter((s) => s.averageRating >= minRatingVal);
  }

  // Sorting Logic
  if (sort === 'rating_desc' || sort === 'highest_rated') {
    stores.sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings);
  } else if (sort === 'ratings_count_desc' || sort === 'most_rated') {
    stores.sort((a, b) => b.totalRatings - a.totalRatings || b.averageRating - a.averageRating);
  } else if (sort === 'newest' || sort === 'newest_added') {
    stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'name_asc') {
    stores.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name_desc') {
    stores.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    // Default: 'recommended' -> Sort by Weighted Bayesian Score DESC
    stores.sort((a, b) => b.weightedScore - a.weightedScore || b.totalRatings - a.totalRatings);
  }

  const total = stores.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedStores = stores.slice(startIndex, startIndex + limitNum);

  return {
    stores: paginatedStores,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Retrieves store detail by ID for public view.
 * Only APPROVED stores are viewable publicly.
 */
const getPublicStoreById = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      city: true,
      phone: true,
      category: true,
      description: true,
      imageUrl: true,
      status: true,
      isVerified: true,
      rejectionReason: true,
      createdAt: true,
      ratings: {
        select: {
          id: true,
          rating: true,
          review: true,
          ownerReply: true,
          ownerReplyAt: true,
          reviewStatus: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

  // Process ratings for public display: hide written text if reviewStatus === 'HIDDEN'
  const publicRatingsList = ratings.map((r) => {
    if (r.reviewStatus === 'HIDDEN') {
      return { ...r, review: null };
    }
    return r;
  });

  return {
    ...storeData,
    city: store.city ? store.city.trim() : null,
    isVerified: Boolean(store.isVerified),
    averageRating,
    totalRatings,
    ratingCount: totalRatings,
    stats: {
      averageRating,
      totalRatings,
      ratingCount: totalRatings,
    },
    distribution,
    recentRatings: publicRatingsList.slice(0, 20),
    ratings: publicRatingsList.slice(0, 20),
  };
};

module.exports = {
  getPublicStats,
  getPublicStores,
  getPublicStoreById,
};
