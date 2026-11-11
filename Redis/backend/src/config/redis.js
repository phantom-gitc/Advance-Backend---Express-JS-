import { createClient } from "redis";

let client;

function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }

  return client;
}

async function connectRedis() {
  const redisClient = getRedisClient();

  if (!redisClient) {
    console.warn("REDIS_URL is not set; Redis caching is disabled.");
    return;
  }

  await redisClient.connect();
  console.log("Redis connected");
}

async function disconnectRedis() {
  if (client?.isOpen) {
    await client.quit();
  }
}

export { connectRedis, disconnectRedis, getRedisClient };
