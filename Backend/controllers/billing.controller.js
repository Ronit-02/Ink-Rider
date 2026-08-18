const crypto = require('crypto');
const User = require('../schemas/user.schema');
const Membership = require('../schemas/membership.schema');
const ProviderEvent = require('../schemas/provider-event.schema');
const { createCheckoutSession, createPortalSession, verifyStripeSignature } = require('../services/stripe.service');

const startCheckout = async (req, res) => {
  try {
    const [user, membership] = await Promise.all([
      User.findById(req.auth.userId).select('email'),
      Membership.findOne({ userId: req.auth.userId }).select('providerCustomerId status'),
    ]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (['active', 'trialing'].includes(membership?.status)) return res.status(409).json({ message: 'Membership is already active' });
    const session = await createCheckoutSession({ userId: req.auth.userId, email: user.email, customerId: membership?.providerCustomerId });
    return res.status(201).json({ data: { checkoutUrl: session.url } });
  } catch (error) {
    if (error.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: error.code, message: 'Membership billing is not available yet' });
    console.error(`[${req.requestId}] Checkout session failed`);
    return res.status(502).json({ message: 'Unable to start membership checkout' });
  }
};

const openBillingPortal = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.auth.userId }).select('providerCustomerId');
    if (!membership?.providerCustomerId) return res.status(409).json({ message: 'No billing account exists' });
    const session = await createPortalSession({ customerId: membership.providerCustomerId });
    return res.json({ data: { portalUrl: session.url } });
  } catch (error) {
    if (error.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: error.code, message: 'Membership billing is not available yet' });
    return res.status(502).json({ message: 'Unable to open billing settings' });
  }
};

const mapSubscriptionStatus = status => ({ active: 'active', trialing: 'trialing', past_due: 'past_due', unpaid: 'past_due', canceled: 'canceled', incomplete_expired: 'canceled' }[status] || 'inactive');

const periodDate = (subscription, field) => {
  const seconds = subscription[field] || subscription.items?.data?.[0]?.[field];
  return seconds ? new Date(seconds * 1000) : null;
};

const processStripeEvent = async event => {
  const object = event.data?.object || {};
  if (event.type === 'checkout.session.completed') {
    const userId = object.metadata?.userId || object.client_reference_id;
    if (!userId) return;
    await Membership.findOneAndUpdate(
      { userId },
      { $set: { plan: 'member', provider: 'stripe', providerCustomerId: object.customer || null, providerSubscriptionId: object.subscription || null, status: ['paid', 'no_payment_required'].includes(object.payment_status) ? 'active' : 'inactive' } },
      { upsert: true, returnDocument: 'after' }
    );
    return;
  }
  if (event.type.startsWith('customer.subscription.')) {
    const userId = object.metadata?.userId;
    const query = userId ? { userId } : { provider: 'stripe', providerSubscriptionId: object.id };
    await Membership.findOneAndUpdate(query, { $set: {
      ...(userId ? { userId } : {}), plan: 'member', provider: 'stripe', providerCustomerId: object.customer || null,
      providerSubscriptionId: object.id, status: event.type === 'customer.subscription.deleted' ? 'canceled' : mapSubscriptionStatus(object.status),
      currentPeriodStart: periodDate(object, 'current_period_start'), currentPeriodEnd: periodDate(object, 'current_period_end'), cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
    } }, { upsert: Boolean(userId), returnDocument: 'after' });
    return;
  }
  if (event.type === 'invoice.payment_failed' && object.subscription) {
    await Membership.updateOne({ provider: 'stripe', providerSubscriptionId: object.subscription }, { $set: { status: 'past_due' } });
  }
};

const stripeWebhook = async (req, res) => {
  if (!verifyStripeSignature(req.rawBody, req.headers['stripe-signature'])) return res.status(400).json({ message: 'Invalid webhook signature' });
  const event = req.body;
  if (!event?.id || !event?.type) return res.status(400).json({ message: 'Invalid provider event' });
  const payloadHash = crypto.createHash('sha256').update(req.rawBody).digest('hex');
  try {
    const receipt = await ProviderEvent.findOneAndUpdate(
      { provider: 'stripe', eventId: event.id },
      { $setOnInsert: { eventType: event.type, payloadHash, status: 'received' } },
      { upsert: true, returnDocument: 'after', includeResultMetadata: true }
    );
    if (!receipt.lastErrorObject?.upserted) return res.json({ received: true, duplicate: true });
    try {
      await processStripeEvent(event);
      await ProviderEvent.updateOne({ provider: 'stripe', eventId: event.id }, { $set: { status: 'processed', processedAt: new Date(), failureCode: null } });
      return res.json({ received: true });
    } catch (error) {
      await ProviderEvent.updateOne({ provider: 'stripe', eventId: event.id }, { $set: { status: 'failed', failureCode: error?.code || 'PROCESSING_FAILED' } });
      return res.status(500).json({ message: 'Webhook processing failed' });
    }
  } catch (error) {
    if (error?.code === 11000) return res.json({ received: true, duplicate: true });
    return res.status(500).json({ message: 'Webhook receipt failed' });
  }
};

module.exports = { startCheckout, openBillingPortal, stripeWebhook, processStripeEvent, mapSubscriptionStatus };
