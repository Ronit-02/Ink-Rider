const Notification = require('../schemas/notification.schema');
const { queueNotificationDelivery } = require('./notification-delivery.service');
const { withTransaction } = require('../utils/transaction');
const { encodeCursor } = require('../utils/cursor');

const listForRecipient = async ({ recipientId, cursor }) => {
  const filter = { recipientId };
  if (cursor) filter.$or = [{ createdAt: { $lt: new Date(cursor.createdAt) } }, { createdAt: new Date(cursor.createdAt), _id: { $lt: cursor.id } }];
  const [documents, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1, _id: -1 }).limit(21).populate('actorId', 'username picture'),
    Notification.countDocuments({ recipientId, readAt: null }),
  ]);
  const hasMore = documents.length > 20;
  const page = hasMore ? documents.slice(0, 20) : documents;
  const last = page.at(-1);
  return { data: page, meta: { unreadCount, nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last._id.toString() }) : null } };
};

const markRead = ({ notificationId, recipientId, now = new Date() }) => Notification.findOneAndUpdate(
  { _id: notificationId, recipientId }, { $set: { readAt: now } }, { returnDocument: 'after' },
);

const markAllRead = ({ recipientId, now = new Date() }) => Notification.updateMany(
  { recipientId, readAt: null }, { $set: { readAt: now } },
);

const notify = async input => {
  if (!input.recipientId || input.recipientId.toString() === input.actorId?.toString()) return null;
  try {
    return await withTransaction(async session => {
      const [notification] = await Notification.create([input], session ? { session } : undefined);
      if (input.delivery) {
        await Promise.all(Object.entries(input.delivery).map(([channel, payload]) => queueNotificationDelivery({
          notificationId: notification._id,
          recipientId: notification.recipientId,
          channel,
          payload,
          session,
        })));
      }
      return notification;
    });
  } catch {
    console.error('Notification delivery needs repair');
    return null;
  }
};

module.exports = { notify, listForRecipient, markRead, markAllRead };
