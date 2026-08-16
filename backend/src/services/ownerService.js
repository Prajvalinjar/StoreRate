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
      category: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      ratings: {
        select: {
          id: true,
          rating: true,
          review: true,
          ownerReply: true,
          ownerReplyAt: true,
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
        review: r.review,
        ownerReply: r.ownerReply,
        ownerReplyAt: r.ownerReplyAt,
        createdAt: r.createdAt,
      }))
    : [];

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      category: store.category || 'General',
      status: store.status,
      rejectionReason: store.rejectionReason,
      createdAt: store.createdAt,
      averageRating,
      totalRatings,
      ratings,
    },
  };
};

const createOwnerStore = async (ownerId, { name, email, address, category }) => {
  const existingStore = await prisma.store.findFirst({
    where: { ownerId },
  });

  if (existingStore) {
    throw new OwnerError('You have already registered a store listing.', 400);
  }

  const storeCategory = category && category.trim() ? category.trim() : 'General';

  const newStore = await prisma.store.create({
    data: {
      name,
      email: email.toLowerCase(),
      address,
      category: storeCategory,
      ownerId,
      status: 'PENDING',
    },
  });

  return newStore;
};

const replyToRating = async (ownerId, ratingId, replyText) => {
  if (!replyText || !replyText.trim()) {
    throw new OwnerError('Reply text cannot be empty', 400);
  }
  if (replyText.length > 500) {
    throw new OwnerError('Reply text cannot exceed 500 characters', 400);
  }

  const rating = await prisma.rating.findUnique({
    where: { id: ratingId },
    include: { store: true },
  });

  if (!rating) {
    throw new OwnerError('Rating not found', 404);
  }

  if (rating.store.ownerId !== ownerId) {
    throw new OwnerError('Forbidden: You can only reply to customer reviews left on your store', 403);
  }

  const updatedRating = await prisma.rating.update({
    where: { id: ratingId },
    data: {
      ownerReply: replyText.trim(),
      ownerReplyAt: new Date(),
    },
  });

  return updatedRating;
};

const deleteReplyFromRating = async (ownerId, ratingId) => {
  const rating = await prisma.rating.findUnique({
    where: { id: ratingId },
    include: { store: true },
  });

  if (!rating) {
    throw new OwnerError('Rating not found', 404);
  }

  if (rating.store.ownerId !== ownerId) {
    throw new OwnerError('Forbidden: You can only manage replies on your own store', 403);
  }

  const updatedRating = await prisma.rating.update({
    where: { id: ratingId },
    data: {
      ownerReply: null,
      ownerReplyAt: null,
    },
  });

  return updatedRating;
};

module.exports = {
  OwnerError,
  getOwnerDashboard,
  createOwnerStore,
  replyToRating,
  deleteReplyFromRating,
};
