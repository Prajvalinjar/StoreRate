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

  const rawAvg = avgResult._avg.rating;
  const averageRating = rawAvg !== null && rawAvg !== undefined ? Number(rawAvg.toFixed(1)) : 0.0;

  return {
    businesses,
    ratings,
    users,
    averageRating,
  };
};

module.exports = {
  getPublicStats,
};
