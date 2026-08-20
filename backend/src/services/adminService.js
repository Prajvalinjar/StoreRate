const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hashUtils');
const { createNotification } = require('./notificationService');
const { analyzeStoreReviews } = require('./aiReviewService');

class AdminError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

const getDashboardMetrics = async () => {
  const [
    totalUsers,
    totalStores,
    approvedStores,
    pendingStores,
    rejectedStores,
    verifiedStores,
    unverifiedStores,
    totalRatings,
    totalWrittenReviews,
    totalFavorites,
    totalReports,
    pendingReportsCount,
    resolvedReportsCount,
    dismissedReportsCount,
    hiddenReviewsCount,
    avgResult,
    ratingGroup,
    userRoles,
    storePerformance
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.store.count({ where: { status: 'APPROVED' } }),
    prisma.store.count({ where: { status: 'PENDING' } }),
    prisma.store.count({ where: { status: 'REJECTED' } }),
    prisma.store.count({ where: { status: 'APPROVED', isVerified: true } }),
    prisma.store.count({ where: { status: 'APPROVED', isVerified: false } }),
    prisma.rating.count(),
    prisma.rating.count({ where: { review: { not: null } } }),
    prisma.favorite.count(),
    prisma.reviewReport.count(),
    prisma.reviewReport.count({ where: { status: 'PENDING' } }),
    prisma.reviewReport.count({ where: { status: 'RESOLVED' } }),
    prisma.reviewReport.count({ where: { status: 'DISMISSED' } }),
    prisma.rating.count({ where: { reviewStatus: 'HIDDEN' } }),
    prisma.rating.aggregate({ _avg: { rating: true } }),
    prisma.rating.groupBy({
      by: ['rating'],
      _count: { rating: true },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.store.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        city: true,
        category: true,
        isVerified: true,
        status: true,
        createdAt: true,
        ratings: {
          select: {
            rating: true,
            review: true,
          },
        },
      },
    }),
  ]);

  const rawAvg = avgResult?._avg?.rating;
  const platformAverageRating =
    rawAvg !== null && rawAvg !== undefined && !isNaN(rawAvg)
      ? Number(rawAvg.toFixed(2))
      : 0.0;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingGroup.forEach((r) => {
    if (ratingDistribution[r.rating] !== undefined) {
      ratingDistribution[r.rating] = r._count.rating;
    }
  });

  const roleDistribution = { USER: 0, STORE_OWNER: 0, ADMIN: 0 };
  userRoles.forEach((r) => {
    roleDistribution[r.role] = r._count.role;
  });

  // Calculate Category Analytics dynamically from DB
  const categoryMap = {};
  const cityMap = {};

  const storesWithPerformance = storePerformance.map((s) => {
    const total = s.ratings.length;
    const writtenCount = s.ratings.filter((r) => r.review && r.review.trim().length > 0).length;
    const sum = s.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    const cat = s.category ? s.category.trim() : 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, storeCount: 0, totalRatings: 0, ratingSum: 0 };
    }
    categoryMap[cat].storeCount += 1;
    categoryMap[cat].totalRatings += total;
    categoryMap[cat].ratingSum += sum;

    const cityName = s.city && s.city.trim() ? s.city.trim() : 'Location not specified';
    if (!cityMap[cityName]) {
      cityMap[cityName] = { name: cityName, storeCount: 0, totalRatings: 0, ratingSum: 0 };
    }
    cityMap[cityName].storeCount += 1;
    cityMap[cityName].totalRatings += total;
    cityMap[cityName].ratingSum += sum;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      city: s.city ? s.city.trim() : null,
      category: cat,
      status: s.status,
      isVerified: Boolean(s.isVerified),
      averageRating,
      totalRatings: total,
      writtenReviewsCount: writtenCount,
      createdAt: s.createdAt,
    };
  });

  storesWithPerformance.sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings);

  const categoryAnalytics = Object.values(categoryMap).map((cat) => ({
    name: cat.name,
    storeCount: cat.storeCount,
    totalRatings: cat.totalRatings,
    averageRating: cat.totalRatings > 0 ? Number((cat.ratingSum / cat.totalRatings).toFixed(1)) : 0,
  }));
  categoryAnalytics.sort((a, b) => b.totalRatings - a.totalRatings || b.storeCount - a.storeCount);

  const cityAnalytics = Object.values(cityMap).map((c) => ({
    name: c.name,
    storeCount: c.storeCount,
    totalRatings: c.totalRatings,
    averageRating: c.totalRatings > 0 ? Number((c.ratingSum / c.totalRatings).toFixed(1)) : 0,
  }));
  cityAnalytics.sort((a, b) => b.storeCount - a.storeCount || b.totalRatings - a.totalRatings);

  return {
    totalUsers,
    totalStores,
    approvedStores,
    pendingStores,
    pendingStoresCount: pendingStores,
    rejectedStores,
    verifiedStores,
    unverifiedStores,
    totalRatings,
    totalWrittenReviews,
    totalFavorites,
    totalReports,
    pendingReportsCount,
    resolvedReportsCount,
    dismissedReportsCount,
    hiddenReviewsCount,
    platformAverageRating,
    ratingDistribution,
    roleDistribution,
    categoryAnalytics,
    cityAnalytics,
    platformSentiment: analyzeStoreReviews(storePerformance.flatMap((s) => s.ratings || [])),
    storePerformance: storesWithPerformance,
    topStores: storesWithPerformance.slice(0, 10),
  };
};

const getPendingStores = async () => {
  const stores = await prisma.store.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      city: true,
      category: true,
      status: true,
      isVerified: true,
      createdAt: true,
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return { stores };
};

const approveStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      status: 'APPROVED',
      rejectionReason: null,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Trigger STORE_APPROVED notification to owner
  try {
    await createNotification({
      userId: updatedStore.ownerId,
      type: 'STORE_APPROVED',
      title: 'Store Listing Approved!',
      message: `Your store listing "${updatedStore.name}" is now live on StoreRate.`,
      link: '/owner',
    });
  } catch (err) {
    console.error('Failed to send store approval notification:', err);
  }

  return updatedStore;
};

const rejectStore = async (storeId, reason) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Business information could not be verified.',
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Trigger STORE_REJECTED notification to owner
  try {
    await createNotification({
      userId: updatedStore.ownerId,
      type: 'STORE_REJECTED',
      title: 'Store Listing Update',
      message: `Your store listing "${updatedStore.name}" was not approved.`,
      link: '/owner',
    });
  } catch (err) {
    console.error('Failed to send store rejection notification:', err);
  }

  return updatedStore;
};

const verifyStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: { isVerified: true },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedStore;
};

const unverifyStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: { isVerified: false },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedStore;
};

const getUsers = async ({ name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;

  const skip = (page - 1) * limit;

  const [total, rawUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    users: rawUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AdminError('User not found', 404);
  }

  if (user.role === 'STORE_OWNER') {
    const stores = await prisma.store.findMany({
      where: { ownerId: id },
      include: {
        ratings: {
          select: { rating: true },
        },
      },
    });

    const storesWithRating = stores.map((store) => {
      const total = store.ratings.length;
      const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
      const { ratings, ...storeData } = store;
      return {
        ...storeData,
        averageRating,
        totalRatings: total,
      };
    });

    return {
      ...user,
      stores: storesWithRating,
    };
  }

  return user;
};

const createUser = async ({ name, email, address, password, role }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AdminError('Email address is already registered', 409);
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      passwordHash: hashedPassword,
      role,
    },
  });

  return sanitizeUser(newUser);
};

const getStores = async ({ name, email, address, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };

  if (sortBy === 'rating') {
    const allStores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    const processed = allStores.map((store) => {
      const total = store.ratings.length;
      const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
      const { ratings, ...storeData } = store;
      return { ...storeData, averageRating, totalRatings: total };
    });

    processed.sort((a, b) => {
      return sortOrder === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating;
    });

    const total = processed.length;
    const paginated = processed.slice((page - 1) * limit, page * limit);

    return {
      stores: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  const skip = (page - 1) * limit;

  const [total, rawStores] = await Promise.all([
    prisma.store.count({ where }),
    prisma.store.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    }),
  ]);

  const stores = rawStores.map((store) => {
    const total = store.ratings.length;
    const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    const { ratings, ...storeData } = store;
    return { ...storeData, averageRating, totalRatings: total };
  });

  return {
    stores,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getStoreById = async (id) => {
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
      ratings: {
        select: { rating: true },
      },
    },
  });

  if (!store) {
    throw new AdminError('Store not found', 404);
  }

  const total = store.ratings.length;
  const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating,
    totalRatings: total,
  };
};

const createStore = async ({ name, email, address, ownerId, city }) => {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new AdminError('Specified store owner does not exist', 404);
  }

  if (owner.role !== 'STORE_OWNER') {
    throw new AdminError('Store owner ID must reference a user with role STORE_OWNER', 400);
  }

  const newStore = await prisma.store.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      city: city && city.trim() ? city.trim() : null,
      isVerified: false,
      ownerId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    ...newStore,
    averageRating: 0,
    totalRatings: 0,
  };
};

const getReviewReports = async () => {
  const reports = await prisma.reviewReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      rating: {
        include: {
          store: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      },
      reporter: { select: { id: true, name: true, email: true } },
      resolvedBy: { select: { id: true, name: true } },
    },
  });

  return { reports };
};

const dismissReport = async (reportId, adminId) => {
  const report = await prisma.reviewReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new AdminError('Report not found', 404);
  }

  const updatedReport = await prisma.reviewReport.update({
    where: { id: reportId },
    data: {
      status: 'DISMISSED',
      resolvedAt: new Date(),
      resolvedById: adminId,
    },
  });

  return updatedReport;
};

const hideReview = async (reportId, adminId) => {
  const report = await prisma.reviewReport.findUnique({
    where: { id: reportId },
    include: {
      rating: {
        include: {
          store: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!report) {
    throw new AdminError('Report not found', 404);
  }

  await prisma.rating.update({
    where: { id: report.ratingId },
    data: { reviewStatus: 'HIDDEN' },
  });

  const updatedReport = await prisma.reviewReport.update({
    where: { id: reportId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedById: adminId,
    },
  });

  // Trigger REVIEW_HIDDEN notification to reviewer
  try {
    await createNotification({
      userId: report.rating.userId,
      type: 'REVIEW_HIDDEN',
      title: 'Review Moderation Update',
      message: `Your review on "${report.rating.store.name}" was hidden by moderators.`,
      link: '/user/ratings',
    });
  } catch (err) {
    console.error('Failed to send review hidden notification:', err);
  }

  return updatedReport;
};

const restoreReview = async (reportId, adminId) => {
  const report = await prisma.reviewReport.findUnique({
    where: { id: reportId },
    include: {
      rating: {
        include: {
          store: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!report) {
    throw new AdminError('Report not found', 404);
  }

  await prisma.rating.update({
    where: { id: report.ratingId },
    data: { reviewStatus: 'VISIBLE' },
  });

  const updatedReport = await prisma.reviewReport.update({
    where: { id: reportId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedById: adminId,
    },
  });

  // Trigger REVIEW_RESTORED notification to reviewer
  try {
    await createNotification({
      userId: report.rating.userId,
      type: 'REVIEW_RESTORED',
      title: 'Review Restored',
      message: `Your review on "${report.rating.store.name}" is visible again.`,
      link: '/user/ratings',
    });
  } catch (err) {
    console.error('Failed to send review restored notification:', err);
  }

  return updatedReport;
};

module.exports = {
  AdminError,
  getDashboardMetrics,
  getUsers,
  getUserById,
  createUser,
  getStores,
  getStoreById,
  createStore,
  getPendingStores,
  approveStore,
  rejectStore,
  verifyStore,
  unverifyStore,
  getReviewReports,
  dismissReport,
  hideReview,
  restoreReview,
};
