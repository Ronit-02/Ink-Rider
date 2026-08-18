const config = require('../config/config');

const sendPush = async delivery => {
  if (!config.PUSH_PROVIDER_URL) {
    const error = new Error('Push provider is not configured');
    error.code = 'PROVIDER_NOT_CONFIGURED';
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(config.PUSH_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(config.PUSH_PROVIDER_TOKEN ? { authorization: `Bearer ${config.PUSH_PROVIDER_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        recipient: delivery.payload?.to,
        title: delivery.payload?.subject,
        body: delivery.payload?.text,
        data: delivery.payload?.data || {},
        idempotencyKey: delivery.idempotencyKey,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.message || 'Push provider request failed');
      error.code = 'PUSH_PROVIDER_ERROR';
      error.status = response.status;
      throw error;
    }
    return { messageId: payload.messageId || payload.id || null };
  } catch (error) {
    if (controller.signal.aborted) {
      const timeoutError = new Error('Push provider request timed out');
      timeoutError.code = 'PROVIDER_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { sendPush };
