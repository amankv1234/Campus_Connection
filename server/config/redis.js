const Redis = require('ioredis');

let redis = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max reconnect attempts reached. Running with DB fallback.');
          return null; // Stop reconnecting to prevent crashing
        }
        return Math.min(times * 1000, 3000);
      },
      connectTimeout: 5000
    });

    redis.on('connect', () => {
      isRedisConnected = true;
      console.log('⚡ [Redis] Connected successfully');
    });

    redis.on('error', (err) => {
      isRedisConnected = false;
      console.warn('⚠️ [Redis] Connection warning (fallback active):', err.message);
    });

    redis.on('close', () => {
      isRedisConnected = false;
    });
  } catch (err) {
    console.warn('⚠️ [Redis] Initialization failed, continuing with fallback:', err.message);
    redis = null;
  }
} else {
  console.log('ℹ️ [Redis] REDIS_URL not configured. Running in fallback mode (direct DB).');
}

/**
 * Check if Redis is alive and ready
 */
const isConnected = () => isRedisConnected && redis && redis.status === 'ready';

module.exports = { redis, isConnected };
