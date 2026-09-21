import express from "express";
import cors from "cors";
import urlRoutes from "../routes/url.routes.js";
import config from "../config/config.js";

const app = express();

const allowedOrigins = [
  config.CLIENT_URL,
  config.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "1mb" }));

app.use("/api/url", urlRoutes);

export default app;