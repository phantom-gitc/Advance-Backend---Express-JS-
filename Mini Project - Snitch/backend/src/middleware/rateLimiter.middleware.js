import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";

// Helper to create Redis-backed store with automatic memory fallback
const createStore = (prefix) => {
  if (redis) {
    try {
      return new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: `ratelimit:${prefix}:`,
      });
    } catch (e) {
      console.warn(`⚠️ Rate-limit RedisStore init error for [${prefix}], using in-memory store:`, e.message);
    }
  }
  return undefined; // Falls back to default memory store in express-rate-limit
};

/**
 * Global API rate limiter:
 * Allows up to 300 requests per 15 minutes per IP.
 * Protects database and server from DDoS and scraping floods.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: true,
  store: createStore("api"),
  skip: (req) => {
    // Skip health checks and static files
    return req.path === "/health" || req.path === "/" || req.path.startsWith("/uploads");
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: "Too many requests from this network. Please wait a moment before trying again.",
      retryAfterMinutes: Math.ceil(options.windowMs / (60 * 1000)),
    });
  },
});

/**
 * Strict Authentication rate limiter:
 * Limits login & registration attempts to 15 per 15-minute window per IP.
 * Protects user credentials and prevents brute-force / password spraying attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 attempts
  standardHeaders: "draft-7",
  legacyHeaders: true,
  store: createStore("auth"),
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts detected. To safeguard accounts, access is temporarily paused. Please try again after 15 minutes.",
      retryAfterMinutes: 15,
    });
  },
});

/**
 * Write / Mutation rate limiter:
 * Limits write mutations (such as product creation and catalog updates) to 40 requests per 10 minutes.
 * Prevents database write saturations and bot spam.
 */
export const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40,
  standardHeaders: "draft-7",
  legacyHeaders: true,
  store: createStore("write"),
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      message: "Action limit exceeded. Please wait a few minutes before submitting more items.",
      retryAfterMinutes: 10,
    });
  },
});
