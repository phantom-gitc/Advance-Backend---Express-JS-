import connectDB from "../config/database.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import fs from "fs";
import path from "path";

const clearAllProducts = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    // Delete all products
    const res = await productModel.deleteMany({});
    console.log(`Deleted ${res.deletedCount} products from database.`);

    // Reset carts
    await cartModel.updateMany({}, { items: [], totalAmount: 0 });
    console.log("Reset active cart items.");

    // Clean local uploads directory if it exists
    const uploadsDir = path.join(process.cwd(), "uploads", "products");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
      console.log(`Cleaned ${files.length} local uploaded image files.`);
    }

    console.log("✅ All product data has been removed. You can now add products manually!");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing products:", err);
    process.exit(1);
  }
};

clearAllProducts();
