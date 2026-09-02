import express from "express";
import userRoutes from "./routes/userRoutes.js";
import { requestLogger } from "./middleware/loggerMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(requestLogger);
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;