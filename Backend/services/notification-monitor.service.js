const NotificationDelivery = require('../schemas/notification-delivery.schema');

const getNotificationDeliveryHealth = async ({ now = new Date() } = {}) => {
  const [counts, oldestPending] = await Promise.all([
    NotificationDelivery.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    NotificationDelivery.findOne({ status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now } }).sort({ nextAttemptAt: 1 }).select('createdAt nextAttemptAt').lean(),
  ]);
  const byStatus = Object.fromEntries(counts.map(item => [item._id, item.count]));
  const pending = (byStatus.pending || 0) + (byStatus.failed || 0);
  return {
    status: pending > 0 || (byStatus.dead || 0) > 0 ? 'attention' : 'ok',
    pending,
    processing: byStatus.processing || 0,
    sent: byStatus.sent || 0,
    dead: byStatus.dead || 0,
    oldestPendingAt: oldestPending?.createdAt?.toISOString() || null,
  };
};

module.exports = { getNotificationDeliveryHealth };
