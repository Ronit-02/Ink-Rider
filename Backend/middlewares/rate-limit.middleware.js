const createRateLimiter = ({ windowMs, max, keyPrefix, keyResolver = req => req.ip }) => {
  const buckets = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, Math.min(windowMs, 60_000));
  cleanup.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${keyResolver(req) || req.ip}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('ratelimit-limit', max);
    res.setHeader('ratelimit-remaining', remaining);
    res.setHeader('ratelimit-reset', Math.ceil(bucket.resetAt / 1000));
    if (bucket.count > max) {
      res.setHeader('retry-after', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', requestId: req.requestId } });
    }
    return next();
  };
};

module.exports = { createRateLimiter };
