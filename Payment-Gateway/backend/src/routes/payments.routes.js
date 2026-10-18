import express from "express";
import {
  createOrder,
  verifyPayment,
  getProducts,
  createProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

/**
 * Product management routes
 */
router.get("/products", getProducts);
router.post("/products", createProduct);

/**
 * @route POST /api/payments/:productId/order
 * @description Create a Razorpay order
 * @access Public
 */
router.post("/:productId/order", createOrder);

/**
 * @route POST /api/payments/verify
 * @description Verify Razorpay payment signature
 * @access Public
 */
router.post("/verify", verifyPayment);

export default router;
