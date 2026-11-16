const { redis, isConnected } = require('../config/redis');
const User = require('../models/User');

const LEADERBOARD_KEY = 'leaderboard:points';

/**
 * Increment user points in Redis Sorted Set
 */
const updateUserPoints = async (userId, pointsDelta = 5) => {
  if (!isConnected()) return;
  try {
    await redis.zincrby(LEADERBOARD_KEY, pointsDelta, userId.toString());
  } catch (err) {
    console.warn('[Redis Leaderboard] Zincrby Error:', err.message);
  }
};

/**
 * Sync entire MongoDB user points into Redis Sorted Set (Cold-start or sync)
 */
const syncLeaderboardFromDB = async () => {
  if (!isConnected()) return;
  try {
    const users = await User.find({}, '_id points').lean();
    if (users.length === 0) return;

    const pipeline = redis.pipeline();
    users.forEach(u => {
      pipeline.zadd(LEADERBOARD_KEY, u.points || 0, u._id.toString());
    });
    await pipeline.exec();
    console.log(`⚡ [Redis Leaderboard] Synced ${users.length} users into Sorted Set`);
  } catch (err) {
    console.warn('[Redis Leaderboard] Sync error:', err.message);
  }
};

/**
 * Get top N leaders using Redis ZREVRANGE + User Details
 */
const getTopLeaders = async (limit = 10) => {
  if (isConnected()) {
    try {
      // Check if leaderboard key exists
      const count = await redis.zcard(LEADERBOARD_KEY);
      if (count === 0) {
        await syncLeaderboardFromDB();
      }

      // Fetch top user IDs with scores (descending)
      const topEntries = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');
      if (topEntries.length > 0) {
        const userIds = [];
        const scoreMap = {};

        for (let i = 0; i < topEntries.length; i += 2) {
          const id = topEntries[i];
          const score = parseInt(topEntries[i + 1], 10);
          userIds.push(id);
          scoreMap[id] = score;
        }

        // Fetch user profiles for these top IDs in 1 single lean query
        const users = await User.find({ _id: { $in: userIds } })
          .select('name profilePic branch year points')
          .lean();

        // Sort them in exact ranking order
        const sorted = userIds
          .map(id => users.find(u => u._id.toString() === id))
          .filter(Boolean)
          .map(u => ({ ...u, points: scoreMap[u._id.toString()] ?? u.points }));

        return sorted;
      }
    } catch (err) {
      console.warn('[Redis Leaderboard] Read error, falling back to MongoDB:', err.message);
    }
  }

  // Fallback to direct MongoDB query
  const dbLeaders = await User.find()
    .select('name profilePic branch year points')
    .sort({ points: -1 })
    .limit(limit)
    .lean();
  return dbLeaders;
};

module.exports = {
  updateUserPoints,
  syncLeaderboardFromDB,
  getTopLeaders
};
