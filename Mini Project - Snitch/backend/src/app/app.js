import express from "express";
import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../routes/product.routes.js";
import cookieParser from "cookie-parser";


const app = express();


// Middleware

app.use(express.json());

app.use(cookieParser());


// Health Check Route


app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});


// All routes

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


// Fallback 404 handler in JSON format


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    });
});

export default app;