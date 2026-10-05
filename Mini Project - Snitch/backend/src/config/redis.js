import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let rawRedisUrl = process.env.REDIS_URL || "";
// Strip any accidental 'redis-cli -u' prefix if user copied directly from dashboard
rawRedisUrl = rawRedisUrl.replace(/^redis-cli\s+-u\s+/i, "").trim();

let redis = null;
let isRedisConnected = false;

if (rawRedisUrl) {
  try {
    redis = new Redis(rawRedisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times > 5) {
          console.warn("⚠️ Redis retry limit reached. Continuing with in-memory / direct DB fallback.");
          return null; // Stop retrying
        }
        return Math.min(times * 500, 3000);
      },
    });

    redis.on("connect", () => {
      isRedisConnected = true;
      console.log("⚡ Redis connected successfully! Caching active ✅");
    });

    redis.on("ready", () => {
      isRedisConnected = true;
    });

    redis.on("error", (err) => {
      isRedisConnected = false;
      console.warn("⚠️ Redis connection issue (falling back to database):", err.message);
    });

    redis.on("close", () => {
      isRedisConnected = false;
    });
  } catch (error) {
    console.warn("⚠️ Failed to initialize Redis client:", error.message);
    redis = null;
  }
} else {
  console.log("ℹ️ No REDIS_URL provided. Operating with direct database queries.");
}

/**
 * Get cached data by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  if (!redis || !isRedisConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis getCache error for [${key}]:`, err.message);
    return null;
  }
};

/**
 * Store data in cache with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds Default: 300s (5 minutes)
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  if (!redis || !isRedisConnected) return;
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch (err) {
    console.warn(`Redis setCache error for [${key}]:`, err.message);
  }
};

/**
 * Invalidate cache keys matching pattern (e.g. 'products:*')
 * @param {string} pattern
 */
export const clearCachePattern = async (pattern) => {
  if (!redis || !isRedisConnected) return;
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    stream.on("data", async (keys = []) => {
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((k) => pipeline.del(k));
        await pipeline.exec();
      }
    });

    stream.on("error", (err) => {
      console.warn(`Redis clearCachePattern error for [${pattern}]:`, err.message);
    });
  } catch (err) {
    console.warn(`Redis clearCachePattern error:`, err.message);
  }
};

export default redis;
