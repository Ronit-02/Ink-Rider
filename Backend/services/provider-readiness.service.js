const config = require('../config/config.js');

const hasConfiguredValue = value => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

const isHttpUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const providerReadiness = (currentConfig = config) => {
  const emailPort = Number(currentConfig.EMAIL_PORT);
  const validEmailPort = Number.isInteger(emailPort) && emailPort > 0 && emailPort <= 65535;
  const emailTransport = hasConfiguredValue(currentConfig.EMAIL_HOST) && validEmailPort && hasConfiguredValue(currentConfig.EMAIL);
  const smtpEmail = emailTransport && hasConfiguredValue(currentConfig.EMAIL_PASSWORD);
  const gmailOAuth = emailTransport && hasConfiguredValue(currentConfig.GOOGLE_CLIENT_ID) && hasConfiguredValue(currentConfig.GOOGLE_CLIENT_SECRET) && hasConfiguredValue(currentConfig.GOOGLE_REFRESH_TOKEN);
  const checks = {
    cloudinary: hasConfiguredValue(currentConfig.CLOUDINARY_CLOUD_NAME) && hasConfiguredValue(currentConfig.CLOUDINARY_API_KEY) && hasConfiguredValue(currentConfig.CLOUDINARY_API_SECRET),
    email: Boolean(smtpEmail || gmailOAuth),
    googleSignIn: hasConfiguredValue(currentConfig.GOOGLE_CLIENT_ID),
    stripeCheckout: hasConfiguredValue(currentConfig.STRIPE_SECRET_KEY) && hasConfiguredValue(currentConfig.STRIPE_MEMBERSHIP_PRICE_ID),
    stripeWebhook: hasConfiguredValue(currentConfig.STRIPE_WEBHOOK_SECRET),
    openAiWritingAssistant: hasConfiguredValue(currentConfig.OPENAI_API_KEY),
    errorMonitor: isHttpUrl(currentConfig.ERROR_MONITOR_URL),
    pushDelivery: isHttpUrl(currentConfig.PUSH_PROVIDER_URL),
  };
  return {
    checks,
    configured: Object.values(checks).filter(Boolean).length,
    total: Object.keys(checks).length,
    missing: Object.entries(checks).filter(([, enabled]) => !enabled).map(([name]) => name),
  };
};

module.exports = { providerReadiness, hasConfiguredValue };
