const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

// All the environment variable required for the project
const requiredEnvVars = [
    'FRONTEND_URL',
    'JWT_SECRET',
];

// Throwing error for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
    (key) => !String(process.env[key] || '').trim()
);

const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = String(process.env.JWT_SECRET || '').trim();
const cookieSecure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : nodeEnv === 'production' || cookieSameSite === 'none';
const trustProxyValue = String(process.env.TRUST_PROXY || '').trim();
const trustProxy = /^\d+$/.test(trustProxyValue)
    ? Number(trustProxyValue)
    : (['loopback', 'linklocal', 'uniquelocal'].includes(trustProxyValue) ? trustProxyValue : false);
const rateLimitBackend = String(process.env.RATE_LIMIT_BACKEND || (nodeEnv === 'production' ? 'mongo' : 'memory')).toLowerCase();
if (!['memory', 'mongo'].includes(rateLimitBackend)) throw new Error('RATE_LIMIT_BACKEND must be memory or mongo');
if (nodeEnv === 'production' && rateLimitBackend === 'memory') throw new Error('Production rate limiting must use the shared mongo backend');
if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
}
if (nodeEnv === 'production' && Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes in production');
}
if (nodeEnv === 'production' && !cookieSecure) {
    throw new Error('COOKIE_SECURE must be true in production');
}
if (!process.env.MONGO_URI && (!process.env.MONGO_HOST || !process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD || !process.env.DB_NAME)) {
    throw new Error('Set MONGO_URI or all of MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, and DB_NAME');
}
if (process.env.MONGO_HOST && !/^[A-Za-z0-9.-]+$/.test(process.env.MONGO_HOST)) throw new Error('MONGO_HOST is invalid');
let frontendOrigin;
try {
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    if (!['http:', 'https:'].includes(frontendUrl.protocol) || frontendUrl.username || frontendUrl.password) throw new Error();
    if (nodeEnv === 'production' && frontendUrl.protocol !== 'https:') throw new Error();
    frontendOrigin = frontendUrl.origin;
} catch {
    throw new Error('FRONTEND_URL must be a valid http or https origin');
}

// Parent config object for all the env vars
const config = {
    NODE_ENV: nodeEnv,
    PORT: Number(process.env.PORT) || 8000,
    SLOW_REQUEST_MS: Number(process.env.SLOW_REQUEST_MS) || 1000,
    SLOW_QUERY_MS: Number(process.env.SLOW_QUERY_MS) || 250,
    RESPONSE_BUDGET_MS: Number(process.env.RESPONSE_BUDGET_MS) || 1000,
    ERROR_MONITOR_URL: process.env.ERROR_MONITOR_URL || null,
    ERROR_MONITOR_TIMEOUT_MS: Number(process.env.ERROR_MONITOR_TIMEOUT_MS) || 2000,
    PROVIDER_TIMEOUT_MS: Number(process.env.PROVIDER_TIMEOUT_MS) || 20000,
    PUSH_PROVIDER_URL: process.env.PUSH_PROVIDER_URL || null,
    PUSH_PROVIDER_TOKEN: process.env.PUSH_PROVIDER_TOKEN || null,
    NOTIFICATION_WORKER_INTERVAL_MS: Number(process.env.NOTIFICATION_WORKER_INTERVAL_MS) || 30000,
    FRONTEND_URL: frontendOrigin,
    COOKIE_SAME_SITE: cookieSameSite,
    COOKIE_SECURE: cookieSecure,
    TRUST_PROXY: trustProxy,
    RATE_LIMIT_BACKEND: rateLimitBackend,

    MONGO_URI: process.env.MONGO_URI || null,
    MONGO_HOST: process.env.MONGO_HOST || null,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    JWT_SECRET: jwtSecret,
    ACCESS_TOKEN_SECRET: crypto.createHmac('sha256', jwtSecret).update('ink-rider:access-token:v1').digest('hex'),
    REFRESH_TOKEN_SECRET: crypto.createHmac('sha256', jwtSecret).update('ink-rider:refresh-token:v1').digest('hex'),
    JWT_ISSUER: 'ink-rider-api',
    JWT_ACCESS_AUDIENCE: 'ink-rider-web',
    JWT_REFRESH_AUDIENCE: 'ink-rider-auth',

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || null,

    EMAIL_HOST: process.env.EMAIL_HOST || null,
    EMAIL_PORT: process.env.EMAIL_PORT || null,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
    EMAIL: process.env.EMAIL || null,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || null,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || null,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || null,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || null,

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || null,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || null,
    STRIPE_MEMBERSHIP_PRICE_ID: process.env.STRIPE_MEMBERSHIP_PRICE_ID || null,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
};

module.exports = config;
