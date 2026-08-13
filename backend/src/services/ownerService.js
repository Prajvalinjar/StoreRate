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

  const totalRatings = store.ratings.length;
  const sum = store.ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : null;

  const ratings = store.ratings.map((r) => ({
    id: r.id,
    userName: r.user.name,
    userEmail: r.user.email,
    rating: r.rating,
    createdAt: r.createdAt,
  }));

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating,
      totalRatings,
      ratings,
    },
  };
};

module.exports = {
  OwnerError,
  getOwnerDashboard,
};
