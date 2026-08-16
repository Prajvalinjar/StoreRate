const prisma = require('../utils/prisma');

class OwnerError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getOwnerDashboard = async (ownerId) => {
  const store = await prisma.store.findFirst({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      ratings: {
        select: {
          id: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!store) {
    return { store: null };
  }

  const isApproved = store.status === 'APPROVED';
  const totalRatings = isApproved ? store.ratings.length : 0;
  const sum = isApproved ? store.ratings.reduce((acc, r) => acc + r.rating, 0) : 0;
  const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : null;

  const ratings = isApproved
    ? store.ratings.map((r) => ({
        id: r.id,
        userName: r.user.name,
        userEmail: r.user.email,
        rating: r.rating,
        createdAt: r.createdAt,
      }))
    : [];

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      status: store.status,
      rejectionReason: store.rejectionReason,
      createdAt: store.createdAt,
      averageRating,
      totalRatings,
      ratings,
    },
  };
};

const createOwnerStore = async (ownerId, { name, email, address }) => {
  const existingStore = await prisma.store.findFirst({
    where: { ownerId },
  });

  if (existingStore) {
    throw new OwnerError('You have already registered a store listing.', 400);
  }

  const newStore = await prisma.store.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      ownerId,
      status: 'PENDING',
    },
  });

  return newStore;
};

module.exports = {
  OwnerError,
  getOwnerDashboard,
  createOwnerStore,
};
