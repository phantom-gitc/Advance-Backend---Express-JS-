import Product from "../models/products.model.js";
import razorpayInstance from "../configs/razorpay.js";
import paymentsModel from "../models/payments.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../configs/config.js";
// Product management controllers

const createProduct = async (req, res) => {
  try {
    const { name, title, price, currency, description, category, stock } = req.body;

    if (!name || !title || price === undefined) {
      return res.status(400).json({ message: "name, title, and price are required" });
    }

    const product = await Product.create({
      name,
      title,
      price,
      currency: currency || "INR",
      description,
      category,
      stock: stock || 0,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Order for a product and save payment record in database

const createOrder = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const amountInPaise = Math.round(product.price * 100);

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: product.currency || "INR",
      receipt: product._id.toString(),
      notes: {
        productId: product._id.toString(),
        productName: product.name,
        productPrice: product.price,
      },
    });

    // Create payment record in database

    const payment = await paymentsModel.create({
      orderId: order.id,
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productCurrency: product.currency || "INR",
      userId: req.user?._id || req.body?.userId || undefined,
      status: "pending",
      amount: amountInPaise,
      currency: product.currency || "INR",
    });

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
      key: config.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const orderId = req.body.orderId || req.body.razorpay_order_id;
    const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
    const signature = req.body.signature || req.body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        message:
          "orderId (or razorpay_order_id), paymentId (or razorpay_payment_id), and signature (or razorpay_signature) are required",
      });
    }

    const payment = await paymentsModel.findOne({ orderId, status: "pending" });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found or already processed" });
    }

    // Verify signature using Razorpay's utility function
    const isValid = validatePaymentVerification(
      { order_id: orderId, payment_id: paymentId },
      signature,
      config.RAZORPAY_KEY_SECRET,
    );

    if (!isValid) {
      await paymentsModel.updateOne(
        { orderId: orderId },
        {
          $set: {
            status: "failed",
            paymentId: paymentId,
            signature: signature,
          },
        },
      );
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Update payment status
    await paymentsModel.updateOne(
      { orderId: orderId },
      {
        $set: {
          status: "completed",
          paymentId: paymentId,
          signature: signature,
        },
      },
    );

    // Send success response
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrder, verifyPayment, getProducts, createProduct };
