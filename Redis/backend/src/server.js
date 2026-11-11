import "dotenv/config";

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

// `|| 5000` also covers a PORT of "0"/empty coming from the shell environment
const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${server.address().port}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down...`);
      server.close(async () => {
        try {
          await Promise.all([disconnectDB(), disconnectRedis()]);
          process.exit(0);
        } catch (err) {
          console.error("Failed to shut down cleanly:", err.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
