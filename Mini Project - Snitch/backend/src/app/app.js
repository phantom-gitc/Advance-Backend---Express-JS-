import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../routes/product.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import cookieParser from "cookie-parser";
import compression from "compression";
import { apiLimiter } from "../middleware/rateLimiter.middleware.js";

import Config from "../config/config.js";

const app = express();

// Trust reverse proxy for Render / Cloud deployments (needed for secure cookies)
app.set("trust proxy", 1);

// Allowed Origins for CORS
const explicitOrigins = [
    Config.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server, Postman, mobile, or requests without Origin header
            if (!origin) {
                return callback(null, true);
            }

            // Check if origin matches configured frontend URL or localhost
            const isExplicitMatch = explicitOrigins.includes(origin);
            const isVercelDomain = /^https:\/\/.*\.vercel\.app$/.test(origin);
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

            if (isExplicitMatch || isVercelDomain || isLocalhost) {
                return callback(null, true);
            }

            // Allow during initial deployment setup
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "token",
            "X-Requested-With",
            "Accept",
            "Origin",
        ],
        exposedHeaders: ["Set-Cookie"],
    })
);

// Performance middleware: compress HTTP responses (gzip/brotli)
app.use(compression());

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve local uploads statically
app.use("/uploads", express.static("uploads"));


// Health Check Route


// Root status endpoint for Render deployment verification
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Snitch Atelier API",
        status: "active",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});


// Rate limiting: Protect API endpoints and database from DDoS/scraping
app.use("/api", apiLimiter);

// All routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


// Fallback 404 handler in JSON format 

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    });
});

export default app;