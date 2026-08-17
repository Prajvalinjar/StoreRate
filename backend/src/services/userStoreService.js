const prisma = require('../utils/prisma');
const { createNotification } = require('./notificationService');

class UserStoreError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getStoresForUser = async (userId) => {
  const rawStores = await prisma.store.findMany({
    where: { status: 'APPROVED' },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      category: true,
      imageUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ratings: {
        select: {
          userId: true,
          rating: true,
          review: true,
        },
      },
    },
  });

  const stores = rawStores.map((store) => {
    const totalRatings = store.ratings.length;
    const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;
    
    const userRatingObj = store.ratings.find((r) => r.userId === userId);
    const userRating = userRatingObj ? userRatingObj.rating : null;
    const userReview = userRatingObj ? userRatingObj.review : null;

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating,
      totalRatings,
      userRating,
      userReview,
    };
  });

  return { stores };
};

const submitRating = async (userId, storeId, rating, review = null) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new UserStoreError('Store not found', 404);
  }

  if (store.status !== 'APPROVED') {
    throw new UserStoreError('Store is not currently available for ratings', 403);
  }

  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  });

  if (existingRating) {
    throw new UserStoreError('Rating already exists for this store. Use PUT to update your review.', 400);
  }

  const newRating = await prisma.rating.create({
    data: {
      userId,
      storeId,
      rating,
      review,
    },
  });

  // Trigger notification to store owner if not rating own store
  if (store.ownerId && store.ownerId !== userId) {
    try {
      const hasWrittenReview = review && review.trim().length > 0;
      await createNotification({
        userId: store.ownerId,
        type: hasWrittenReview ? 'NEW_REVIEW' : 'NEW_RATING',
        title: hasWrittenReview ? 'New Customer Review Received' : 'New Customer Rating Received',
        message: hasWrittenReview
          ? `A customer left a ${rating}-star review for "${store.name}".`
          : `Your store "${store.name}" received a ${rating}-star rating.`,
        link: '/owner',
      });
    } catch (err) {
      console.error('Failed to send rating notification:', err);
    }
  }

  return newRating;
};

const updateRating = async (userId, storeId, rating, review = null) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new UserStoreError('Store not found', 404);
  }

  if (store.status !== 'APPROVED') {
    throw new UserStoreError('Store is not currently available for ratings', 403);
  }

  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  });

  if (!existingRating) {
    throw new UserStoreError('No existing rating found for this store. Submit a rating first.', 404);
  }

  const updatedRating = await prisma.rating.update({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    data: {
      rating,
      review,
    },
  });

  // Trigger notification to store owner
  if (store.ownerId && store.ownerId !== userId) {
    try {
      const hasWrittenReview = review && review.trim().length > 0;
      await createNotification({
        userId: store.ownerId,
        type: hasWrittenReview ? 'NEW_REVIEW' : 'NEW_RATING',
        title: hasWrittenReview ? 'Customer Updated Their Review' : 'Customer Updated Their Rating',
        message: `A customer updated their feedback for "${store.name}" to ${rating} stars.`,
        link: '/owner',
      });
    } catch (err) {
      console.error('Failed to send rating update notification:', err);
    }
  }

  return updatedRating;
};

const getUserRatings = async (userId) => {
  const ratings = await prisma.rating.findMany({
    where: { userId },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          address: true,
          category: true,
          imageUrl: true,
          status: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return { ratings };
};

const getUserDashboard = async (userId) => {
  const [ratings, favoritesCount, unreadNotificationsCount, recentNotifications] = await Promise.all([
    prisma.rating.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            category: true,
            imageUrl: true,
            status: true,
            isVerified: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const ratingsSubmittedCount = ratings.length;
  const writtenReviewsCount = ratings.filter((r) => r.review && r.review.trim().length > 0).length;

  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRatingGiven = ratingsSubmittedCount > 0
    ? Number((sum / ratingsSubmittedCount).toFixed(1))
    : 0;

  const highestRatingGiven = ratingsSubmittedCount > 0
    ? Math.max(...ratings.map((r) => r.rating))
    : null;

  const lowestRatingGiven = ratingsSubmittedCount > 0
    ? Math.min(...ratings.map((r) => r.rating))
    : null;

  return {
    summary: {
      ratingsSubmittedCount,
      writtenReviewsCount,
      favoriteStoresCount: favoritesCount,
      unreadNotificationsCount,
      averageRatingGiven,
      highestRatingGiven,
      lowestRatingGiven,
    },
    recentRatings: ratings.slice(0, 5),
    recentNotifications,
  };
};

module.exports = {
  UserStoreError,
  getStoresForUser,
  submitRating,
  updateRating,
  getUserRatings,
  getUserDashboard,
};
