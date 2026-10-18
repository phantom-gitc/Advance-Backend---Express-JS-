import express from "express";
import morgan from "morgan";
import cors from "cors";
import paymentsRoutes from "../routes/payments.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes 
app.use("/api/payments", paymentsRoutes);

export default app;