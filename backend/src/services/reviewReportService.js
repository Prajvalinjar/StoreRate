const prisma = require('../utils/prisma');
const { createNotification } = require('./notificationService');

class ReportError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ALLOWED_REASONS = ['SPAM', 'OFFENSIVE', 'HARASSMENT', 'MISLEADING', 'INAPPROPRIATE', 'OTHER'];

const createReport = async (reporterId, ratingId, { reason, description }) => {
  if (!reason || !ALLOWED_REASONS.includes(reason.toUpperCase())) {
    throw new ReportError(`Invalid report reason. Allowed values: ${ALLOWED_REASONS.join(', ')}`, 400);
  }

  if (description && description.length > 500) {
    throw new ReportError('Description cannot exceed 500 characters', 400);
  }

  const rating = await prisma.rating.findUnique({
    where: { id: ratingId },
    include: { store: true },
  });

  if (!rating) {
    throw new ReportError('Review not found', 404);
  }

  // Check for duplicate report
  const existingReport = await prisma.reviewReport.findUnique({
    where: {
      ratingId_reporterId: {
        ratingId,
        reporterId,
      },
    },
  });

  if (existingReport) {
    throw new ReportError('You have already reported this review.', 409);
  }

  const cleanDescription = description && description.trim() ? description.trim() : null;

  const newReport = await prisma.reviewReport.create({
    data: {
      ratingId,
      reporterId,
      reason: reason.toUpperCase(),
      description: cleanDescription,
      status: 'PENDING',
    },
  });

  // Trigger REVIEW_REPORTED notification to all ADMIN users
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'REVIEW_REPORTED',
        title: 'Review Reported for Moderation',
        message: `A review on "${rating.store.name}" was flagged for ${reason.toUpperCase()}.`,
        link: '/admin/reports',
      });
    }
  } catch (err) {
    console.error('Failed to send review report notification:', err);
  }

  return newReport;
};

module.exports = {
  ReportError,
  createReport,
};
