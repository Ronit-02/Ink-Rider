const crypto = require('crypto');
const config = require('../config/config');

const stripeConfigured = () => Boolean(config.STRIPE_SECRET_KEY && config.STRIPE_MEMBERSHIP_PRICE_ID);

const stripeRequest = async (path, params, { fetchImpl = globalThis.fetch, timeoutMs = config.PROVIDER_TIMEOUT_MS, secretKey = config.STRIPE_SECRET_KEY } = {}) => {
  if (!secretKey) throw Object.assign(new Error('Stripe is not configured'), { code: 'PROVIDER_NOT_CONFIGURED' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`https://api.stripe.com/v1/${path}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secretKey}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data?.error?.message || 'Stripe request failed'), { code: 'PROVIDER_ERROR', status: response.status });
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw Object.assign(new Error('Stripe request timed out'), { code: 'PROVIDER_TIMEOUT' });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const createCheckoutSession = ({ userId, email, customerId }) => {
  if (!stripeConfigured()) throw Object.assign(new Error('Membership billing is not configured'), { code: 'PROVIDER_NOT_CONFIGURED' });
  const params = {
    mode: 'subscription',
    'line_items[0][price]': config.STRIPE_MEMBERSHIP_PRICE_ID,
    'line_items[0][quantity]': '1',
    client_reference_id: userId,
    'metadata[userId]': userId,
    'subscription_data[metadata][userId]': userId,
    success_url: `${config.FRONTEND_URL}/members?checkout=success`,
    cancel_url: `${config.FRONTEND_URL}/members?checkout=canceled`,
    allow_promotion_codes: 'true',
  };
  if (customerId) params.customer = customerId;
  else params.customer_email = email;
  return stripeRequest('checkout/sessions', params);
};

const createPortalSession = ({ customerId }) => stripeRequest('billing_portal/sessions', {
  customer: customerId,
  return_url: `${config.FRONTEND_URL}/profile`,
});

const verifyStripeSignature = (rawBody, signatureHeader, toleranceSeconds = 300) => {
  if (!config.STRIPE_WEBHOOK_SECRET || !Buffer.isBuffer(rawBody) || !signatureHeader) return false;
  const fields = String(signatureHeader).split(',').map(item => item.split('=', 2));
  const timestamp = fields.find(([key]) => key === 't')?.[1];
  const signatures = fields.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', config.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  return signatures.some(signature => {
    const left = Buffer.from(signature, 'hex');
    const right = Buffer.from(expected, 'hex');
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  });
};

module.exports = { stripeConfigured, stripeRequest, createCheckoutSession, createPortalSession, verifyStripeSignature };
