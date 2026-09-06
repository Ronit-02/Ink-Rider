const config = require('../config/config');
const RateLimitBucket = require('../schemas/rate-limit-bucket.schema');
const crypto = require('crypto');

const createRateLimiter = ({ windowMs, max, keyPrefix, keyResolver = req => req.ip }) => {
  const buckets = new Map();
  const maxBuckets = 10_000;
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, Math.min(windowMs, 60_000));
  cleanup.unref();

  const sendResult = (bucket, req, res, next) => {
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('ratelimit-limit', max);
    res.setHeader('ratelimit-remaining', remaining);
    res.setHeader('ratelimit-reset', Math.ceil(bucket.resetAt / 1000));
    if (bucket.count > max) {
      res.setHeader('retry-after', Math.ceil((bucket.resetAt - Date.now()) / 1000));
      return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', requestId: req.requestId } });
    }
    return next();
  };

  return async (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${keyResolver(req) || req.ip}`;
    if (config.RATE_LIMIT_BACKEND === 'mongo') {
      const resetAt = Math.floor(now / windowMs) * windowMs + windowMs;
      const keyHash = crypto.createHmac('sha256', config.JWT_SECRET).update(key).digest('hex');
      const bucketKey = `${keyPrefix}:${keyHash}:${resetAt}`;
      try {
        let bucket;
        try {
          bucket = await RateLimitBucket.findOneAndUpdate(
            { key: bucketKey },
            { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt) } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).lean();
        } catch (error) {
          if (error?.code !== 11000) throw error;
          bucket = await RateLimitBucket.findOneAndUpdate(
            { key: bucketKey },
            { $inc: { count: 1 } },
            { new: true }
          ).lean();
        }
        return sendResult({ count: bucket.count, resetAt }, req, res, next);
      } catch {
        return res.status(503).json({ error: { code: 'RATE_LIMIT_UNAVAILABLE', message: 'Request cannot be processed at this time.', requestId: req.requestId } });
      }
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      if (!bucket && buckets.size >= maxBuckets) {
        for (const [oldestKey] of buckets) {
          buckets.delete(oldestKey);
          break;
        }
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    return sendResult(bucket, req, res, next);
  };
};

module.exports = { createRateLimiter };
