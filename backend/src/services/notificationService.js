const prisma = require('../utils/prisma');

class NotificationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
  Safely creates a notification for a user.
  Catches errors internally to prevent breaking primary business workflows.
 */
const createNotification = async ({ userId, type, title, message, link = null }) => {
  if (!userId || !type || !title || !message) {
    console.error('Invalid notification parameters:', { userId, type, title, message });
    return null;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification silently:', error);
    return null;
  }
};

const getUserNotifications = async (userId) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
};

const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotificationError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new NotificationError('Forbidden: You can only manage your own notifications', 403);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
};

const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { message: 'All notifications marked as read' };
};

module.exports = {
  NotificationError,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
