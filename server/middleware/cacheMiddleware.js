const { redis, isConnected } = require('../config/redis');

/**
 * Cache Middleware (Cache-Aside pattern)
 * @param {string} keyPrefix - Prefix for Redis key
 * @param {number} ttlSeconds - Time-to-live in seconds (default 300s = 5m)
 */
const cacheMiddleware = (keyPrefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (!isConnected()) {
      return next(); // Fallback to DB query seamlessly
    }

    try {
      // Build cache key based on route path and query parameters
      const queryString = Object.keys(req.query).sort().map(k => `${k}=${req.query[k]}`).join('&');
      const cacheKey = queryString ? `${keyPrefix}:${req.path}:${queryString}` : `${keyPrefix}:${req.path}`;

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Intercept res.json to store result in Redis
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache only 2xx successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, JSON.stringify(body), 'EX', ttlSeconds).catch(err => {
            console.warn('[Redis Cache] Set error:', err.message);
          });
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.warn('[Redis Cache Middleware] Error:', err.message);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - e.g. "opportunities:*"
 */
const clearCacheByPattern = async (pattern) => {
  if (!isConnected()) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 [Redis] Cleared ${keys.length} keys matching "${pattern}"`);
    }
  } catch (err) {
    console.warn('[Redis ClearCache] Error:', err.message);
  }
};

module.exports = { cacheMiddleware, clearCacheByPattern };
