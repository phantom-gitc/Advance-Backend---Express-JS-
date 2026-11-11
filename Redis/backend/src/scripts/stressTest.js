import "dotenv/config";
import autocannon from "autocannon";
import { Types } from "mongoose";
import { availableParallelism } from "node:os";
import { connectRedis, disconnectRedis, getRedisClient } from "../config/redis.js";

const duration = 60;
const workers = Number.parseInt(process.env.STRESS_WORKERS || `${availableParallelism()}`, 10);
const connectionsPerWorker = Number.parseInt(process.env.STRESS_CONNECTIONS_PER_WORKER || "10", 10);
const connections = workers * connectionsPerWorker;
const pipelining = 10;
const baseUrl = (process.env.STRESS_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`).replace(/\/$/, "");
const testId = new Types.ObjectId().toString();
const cacheKey = `user:profile:${testId}`;

function readInfoCounter(info, name) {
  const match = info.match(new RegExp(`^${name}:(\\d+)$`, "m"));
  return match ? Number(match[1]) : null;
}

let redisClient;
let cacheSeeded = false;

try {
  await connectRedis();
  redisClient = getRedisClient();

  // This synthetic, short-lived entry keeps benchmark traffic on the Redis hit path
  // instead of creating sustained MongoDB reads.
  await redisClient.setEx(
    cacheKey,
    duration + 60,
    JSON.stringify({ _id: testId, name: "Autocannon Redis stress test", email: "stress-test@example.invalid" })
  );
  cacheSeeded = true;

  const warmup = await fetch(`${baseUrl}/api/users/${testId}`);
  if (!warmup.ok) {
    throw new Error(`Warmup request returned HTTP ${warmup.status}; ensure the backend is running at ${baseUrl}`);
  }

  const beforeInfo = await redisClient.info("stats");
  const result = await autocannon({
    url: `${baseUrl}/api/users/${testId}`,
    connections,
    pipelining,
    duration,
    workers,
    title: "Redis-backed profile cache",
  });
  const afterInfo = await redisClient.info("stats");
  const hitsBefore = readInfoCounter(beforeInfo, "keyspace_hits");
  const hitsAfter = readInfoCounter(afterInfo, "keyspace_hits");

  console.log("\n60 second Redis cache stress test");
  console.log(`Target: ${baseUrl}/api/users/:id`);
  console.log(`Load: ${workers} workers (all available CPU cores), ${connections} connections, pipelining ${pipelining}`);
  console.log(`Requests/sec: average ${result.requests.average}, max ${result.requests.max}`);
  console.log(`Latency (ms): average ${result.latency.average}, p99 ${result.latency.p99}`);
  console.log(`Throughput: ${result.throughput.average} bytes/sec average`);
  console.log(`Completed: ${result.requests.total}; non-2xx: ${result.non2xx}; errors: ${result.errors}; timeouts: ${result.timeouts}`);
  if (hitsBefore !== null && hitsAfter !== null) {
    console.log(`Redis keyspace hits during run: ${hitsAfter - hitsBefore}`);
  }
} catch (error) {
  console.error(`Stress test failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (cacheSeeded && redisClient?.isReady) {
    await redisClient.del(cacheKey).catch((error) => {
      console.error(`Could not remove temporary stress-test cache key: ${error.message}`);
      process.exitCode = 1;
    });
  }
  await disconnectRedis().catch((error) => {
    console.error(`Redis disconnect failed: ${error.message}`);
    process.exitCode = 1;
  });
}
