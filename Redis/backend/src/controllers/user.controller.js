import mongoose from "mongoose";
import User from "../models/User.js";
import { getRedisClient } from "../config/redis.js";

// GET /api/user/profile/:id
async function getProfile(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const redisClient = getRedisClient();
    const cacheKey = `user:profile:${id}`;

    if (redisClient?.isReady) {
      try {
        const cachedUser = await redisClient.get(cacheKey);
        if (cachedUser) {
          return res.json({ data: JSON.parse(cachedUser) });
        }
      } catch (err) {
        console.error("Redis profile cache read failed:", err.message);
      }
    }

    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (redisClient?.isReady) {
      try {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(user));
      } catch (err) {
        console.error("Redis profile cache write failed:", err.message);
      }
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export { getProfile };
 
