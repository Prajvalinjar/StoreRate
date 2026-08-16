const prisma = require('../utils/prisma');
const { createNotification } = require('./notificationService');

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
      city: store.city || 'Kolhapur',
      phone: store.phone,
      category: store.category || 'General',
      description: store.description,
      imageUrl: store.imageUrl,
      status: store.status,
      isVerified: store.isVerified,
      rejectionReason: store.rejectionReason,
      createdAt: store.createdAt,
      averageRating,
      totalRatings,
      ratings,
    },
  };
};

const createOwnerStore = async (ownerId, { name, email, address, category, city, phone, description, imageUrl }) => {
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
      city: city && city.trim() ? city.trim() : 'Kolhapur',
      phone: phone && phone.trim() ? phone.trim() : null,
      category: storeCategory,
      description: description && description.trim() ? description.trim() : null,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      ownerId,
      status: 'PENDING',
    },
  });

  // Trigger NEW_STORE_SUBMISSION notification to all ADMIN users
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'NEW_STORE_SUBMISSION',
        title: 'New Store Listing Submitted',
        message: `"${newStore.name}" is pending approval.`,
        link: '/admin?tab=pending',
      });
    }
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }

  return newStore;
};

const updateOwnerStore = async (ownerId, storeId, updateData) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new OwnerError('Store not found', 404);
  }

  if (store.ownerId !== ownerId) {
    throw new OwnerError('Forbidden: You can only update your assigned store', 403);
  }

  const { name, category, description, address, city, phone, imageUrl } = updateData;

  const dataToUpdate = {};
  if (name && name.trim()) dataToUpdate.name = name.trim();
  if (category && category.trim()) dataToUpdate.category = category.trim();
  if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
  if (address && address.trim()) dataToUpdate.address = address.trim();
  if (city !== undefined) dataToUpdate.city = city ? city.trim() : 'Kolhapur';
  if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
  if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl ? imageUrl.trim() : null;

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: dataToUpdate,
  });

  return updatedStore;
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

  // Trigger OWNER_REPLY notification to customer
  try {
    await createNotification({
      userId: rating.userId,
      type: 'OWNER_REPLY',
      title: 'Store Owner Replied to Your Review',
      message: `The owner of "${rating.store.name}" responded to your review.`,
      link: `/stores/${rating.storeId}`,
    });
  } catch (err) {
    console.error('Failed to send owner reply notification:', err);
  }

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
  updateOwnerStore,
  replyToRating,
  deleteReplyFromRating,
};
