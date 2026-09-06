const mongoose = require('mongoose');
const { decodeCursor } = require('../utils/cursor');
const { listForRecipient, markRead, markAllRead: markAllReadNotifications } = require('../services/notification.service');
const { success, failure, noContent } = require('../utils/api-response');

const listNotifications = async (req, res) => {
  try {
    const cursor = req.query.cursor ? decodeCursor(req.query.cursor) : null;
    if (req.query.cursor && (!cursor || !mongoose.isValidObjectId(cursor.id) || Number.isNaN(new Date(cursor.createdAt).getTime()))) return res.status(400).json({ message: 'Invalid notification cursor' });
    const page = await listForRecipient({ recipientId: req.auth.userId, cursor });
    return success(res, page.data, page.meta);
  } catch { return failure(res, 500, 'Unable to load notifications', 'NOTIFICATIONS_UNAVAILABLE'); }
};

const markNotificationRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.notificationId)) return failure(res, 400, 'Invalid notification id', 'INVALID_NOTIFICATION_ID');
  const notification = await markRead({ notificationId: req.params.notificationId, recipientId: req.auth.userId });
  if (!notification) return failure(res, 404, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
  return success(res, notification);
};

const markAllRead = async (req, res) => {
  await markAllReadNotifications({ recipientId: req.auth.userId });
  return noContent(res);
};

module.exports = { listNotifications, markNotificationRead, markAllRead };
