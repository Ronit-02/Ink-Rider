const NotificationDelivery = require('../schemas/notification-delivery.schema');
const { sendEmail } = require('./email.service');
const { sendPush } = require('./push.service');

const MAX_ATTEMPTS = 5;
const BASE_RETRY_MS = 15 * 60 * 1000;

const calculateRetryAt = (attempt, now = new Date()) => new Date(now.getTime() + (BASE_RETRY_MS * (2 ** Math.max(0, attempt - 1))));

const queueNotificationDelivery = async ({ notificationId, recipientId, channel, payload, session = null }) => {
  if (!notificationId || !recipientId || !['email', 'push'].includes(channel)) return null;
  const idempotencyKey = `${notificationId}:${channel}`;
  return NotificationDelivery.findOneAndUpdate(
    { idempotencyKey },
    { $setOnInsert: { notificationId, recipientId, channel, payload, idempotencyKey } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true, ...(session ? { session } : {}) },
  );
};

const deliverEmail = delivery => sendEmail(
  delivery.payload.to,
  delivery.payload.subject,
  delivery.payload.text,
  delivery.payload.html,
);

const deliverPush = delivery => sendPush(delivery);

const processNotificationDeliveryJobs = async ({ limit = 20, now = new Date(), sendEmailFn = deliverEmail, sendPushFn = deliverPush } = {}) => {
  const stats = { processed: 0, sent: 0, retried: 0, dead: 0 };
  for (let index = 0; index < limit; index += 1) {
    const delivery = await NotificationDelivery.findOneAndUpdate(
      { status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now }, attempts: { $lt: MAX_ATTEMPTS } },
      { $set: { status: 'processing', lockedAt: now }, $inc: { attempts: 1 } },
      { returnDocument: 'after', sort: { nextAttemptAt: 1, createdAt: 1 } },
    );
    if (!delivery) break;
    stats.processed += 1;
    try {
      const result = delivery.channel === 'email'
        ? await sendEmailFn(delivery)
        : await sendPushFn(delivery);
      await NotificationDelivery.updateOne({ _id: delivery._id }, { $set: { status: 'sent', sentAt: new Date(), providerMessageId: result?.messageId || null, lockedAt: null } });
      stats.sent += 1;
    } catch (error) {
      const dead = delivery.attempts >= MAX_ATTEMPTS;
      await NotificationDelivery.updateOne({ _id: delivery._id }, { $set: { status: dead ? 'dead' : 'failed', nextAttemptAt: calculateRetryAt(delivery.attempts, now), lastErrorCode: error?.code || 'DELIVERY_FAILED', lockedAt: null } });
      stats[dead ? 'dead' : 'retried'] += 1;
    }
  }
  return stats;
};

module.exports = { MAX_ATTEMPTS, BASE_RETRY_MS, calculateRetryAt, queueNotificationDelivery, processNotificationDeliveryJobs, deliverEmail, deliverPush };
