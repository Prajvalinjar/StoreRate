const prisma = require('../utils/prisma');

class UserStoreError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getStoresForUser = async (userId, { name, address, q }) => {
  const where = {
    status: 'APPROVED',
  };

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where.AND = [
      {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    ];
  } else {
    if (name && name.trim()) {
      where.name = { contains: name.trim(), mode: 'insensitive' };
    }
    if (address && address.trim()) {
      where.address = { contains: address.trim(), mode: 'insensitive' };
    }
  }

  const rawStores = await prisma.store.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      ratings: {
        select: {
          userId: true,
          rating: true,
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

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating,
      totalRatings,
      userRating,
    };
  });

  return { stores };
};

const submitRating = async (userId, storeId, rating) => {
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
    throw new UserStoreError('Rating already exists for this store. Use PUT to update your rating.', 400);
  }

  const newRating = await prisma.rating.create({
    data: {
      userId,
      storeId,
      rating,
    },
  });

  return newRating;
};

const updateRating = async (userId, storeId, rating) => {
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
    },
  });

  return updatedRating;
};

const getUserRatings = async (userId) => {
  const rawRatings = await prisma.rating.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          address: true,
          email: true,
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  const ratings = rawRatings.map((r) => {
    const totalRatings = r.store.ratings.length;
    const sum = r.store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

    return {
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      store: {
        id: r.store.id,
        name: r.store.name,
        address: r.store.address,
        email: r.store.email,
        averageRating,
        totalRatings,
        userRating: r.rating,
      },
    };
  });

  return { ratings };
};

module.exports = {
  UserStoreError,
  getStoresForUser,
  submitRating,
  updateRating,
  getUserRatings,
};
