const dotenv = require('dotenv');
dotenv.config();

// All the environment variable required for the project
const requiredEnvVars = [
    'FRONTEND_URL',
    'JWT_SECRET',
];

// Throwing error for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
    (key) => !process.env[key]
);

const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const cookieSecure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : nodeEnv === 'production' || cookieSameSite === 'none';
if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
}
if (!process.env.MONGO_URI && (!process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD || !process.env.DB_NAME)) {
    throw new Error('Set MONGO_URI or all of MONGO_USERNAME, MONGO_PASSWORD, and DB_NAME');
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
    FRONTEND_URL: process.env.FRONTEND_URL,
    COOKIE_SAME_SITE: cookieSameSite,
    COOKIE_SECURE: cookieSecure,

    MONGO_URI: process.env.MONGO_URI || null,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    JWT_SECRET: process.env.JWT_SECRET,

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
