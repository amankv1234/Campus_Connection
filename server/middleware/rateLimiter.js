const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redis, isConnected } = require('../config/redis');

/**
 * Helper to build rate limiter with Redis store fallback to in-memory
 */
const createLimiter = (options) => {
  const store = isConnected()
    ? new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: options.prefix || 'rl:'
      })
    : undefined; // Defaults to MemoryStore if Redis isn't connected

  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: options.message || 'Too many requests, please try again later.' },
    store
  });
};

// 1. Auth Limiter: Max 10 attempts per 15 minutes to prevent brute-force
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  prefix: 'rl:auth:',
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// 2. AI Limiter: Max 20 requests per minute to prevent API exhaustion
const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  prefix: 'rl:ai:',
  message: 'AI Assistant rate limit reached. Please wait a minute before asking again.'
});

// 3. Post Creation Limiter: Max 15 posts per 10 minutes to prevent spam
const postLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  prefix: 'rl:post:',
  message: 'Posting limit reached. Please wait a few minutes before creating new posts.'
});

module.exports = { authLimiter, aiLimiter, postLimiter };
