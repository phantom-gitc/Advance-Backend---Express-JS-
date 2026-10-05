import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import { uploadToImageKit, uploadMultipleToImageKit } from "../services/imageKit.service.js";
import { getCache, setCache, clearCachePattern } from "../config/redis.js";


// Create a product 

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, sizes, stock, category, subCategory } = req.body;
        const seller = req.user.userId;

        const files = req.files || [];

        // Extract any existing string image URLs provided in req.body
        const bodyImages = Array.isArray(req.body.images)
            ? req.body.images.filter((img) => typeof img === "string" && img.trim().length > 0)
            : typeof req.body.images === "string" && req.body.images.trim().length > 0
            ? [req.body.images.trim()]
            : [];

        // Validate total images count (uploaded files + existing URLs)
        if (files.length + bodyImages.length > 5) {
            return res.status(400).json({
                success: false,
                message: "A maximum of 5 images can be uploaded",
            });
        }

        // Upload images concurrently to ImageKit in parallel via Promise.all
        const uploadedUrls = files.length > 0
            ? await uploadMultipleToImageKit(files, "/products")
            : [];

        // Combine newly uploaded ImageKit URLs with any existing string URLs
        const finalImages = [...uploadedUrls, ...bodyImages];

        const product = await productModel.create({
            title,
            description,
            price,
            sizes,
            stock,
            seller,
            category: category || "Shirts (Topwear)",
            subCategory: subCategory || "Casual & Resort Wear",
            images: finalImages,
        });

        // Invalidate stale Redis product caches so new silhouette displays immediately
        await clearCachePattern("products:*");

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);

        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while creating product",
        });
    }
};


// Helper to format product sizes with availability status (Requirement 6)

export const formatProductAvailability = (product) => {
    const prodObj = product.toObject ? product.toObject() : { ...product };

    const sizeStockMap = new Map();
    if (Array.isArray(prodObj.sizeStock) && prodObj.sizeStock.length > 0) {
        prodObj.sizeStock.forEach((item) => {
            sizeStockMap.set(item.size, item.stock);
        });
    }

    const sizesWithStatus = (prodObj.sizes || []).map((size) => {
        const availableStock = sizeStockMap.has(size)
            ? sizeStockMap.get(size)
            : (prodObj.stock || 0);

        return {
            size,
            status: availableStock > 0 ? "Available" : "Unavailable",
            isAvailable: availableStock > 0,
            stock: availableStock,
        };
    });

    return {
        ...prodObj,
        sizesWithStatus,
    };
};


// Get all the products from the DB (public catalog with optional category & subcategory filters)
export const getAllProducts = async (req, res) => {
    try {
        const catKey = req.query.category || "all";
        const subKey = req.query.subCategory || "all";
        const searchKey = req.query.search || "";
        const cacheKey = `products:feed:${catKey}:${subKey}:${searchKey}`.toLowerCase();

        // 1. Try Redis Cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            res.set("X-Cache", "HIT");
            return res.status(200).json(cachedData);
        }

        const query = { isUnlisted: { $ne: true } };

        if (req.query.category && req.query.category !== "all" && req.query.category !== "All") {
            const escapedCat = req.query.category.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            query.category = { $regex: new RegExp(escapedCat, "i") };
        }

        if (req.query.subCategory && req.query.subCategory !== "all" && req.query.subCategory !== "All") {
            const escapedSub = req.query.subCategory.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            query.subCategory = { $regex: new RegExp(escapedSub, "i") };
        }

        // 2. High-performance lean Mongo query
        const products = await productModel.find(query).sort({ createdAt: -1 }).lean();

        const formattedProducts = (products || []).map(formatProductAvailability);

        const responsePayload = {
            success: true,
            message: "Products fetched successfully",
            count: formattedProducts.length,
            products: formattedProducts,
        };

        // 3. Store in Redis cache for 3 minutes (180s)
        await setCache(cacheKey, responsePayload, 180);

        res.set("X-Cache", "MISS");
        return res.status(200).json(responsePayload);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while fetching products",
        });
    }
};


// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const cacheKey = `products:detail:${id}`;

        // 1. Check Redis Cache
        const cachedProduct = await getCache(cacheKey);
        if (cachedProduct) {
            res.set("X-Cache", "HIT");
            return res.status(200).json(cachedProduct);
        }

        const product = await productModel.findById(id).lean();

        if (!product || product.isUnlisted) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const formattedProduct = formatProductAvailability(product);
        const responsePayload = {
            success: true,
            message: "Product fetched successfully",
            product: formattedProduct,
        };

        // Cache product details for 5 minutes (300s)
        await setCache(cacheKey, responsePayload, 300);

        res.set("X-Cache", "MISS");
        return res.status(200).json(responsePayload);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while fetching product",
        });
    }
};


// A seller can list all the products on the dashboard (Requirement 8)

export const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const products = await productModel.find({ seller: sellerId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Seller products fetched successfully",
            count: products.length,
            products: products.map(formatProductAvailability),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while fetching dashboard products",
        });
    }
};


// Unlist a product (only by the seller who created it - Requirement 7)

export const unlistProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.userId;

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Find product by ID
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Ensure the seller owns this product
        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action",
            });
        }

        product.isUnlisted = true;
        await product.save();

        // Invalidate Redis product caches
        await clearCachePattern("products:*");

        return res.status(200).json({
            success: true,
            message: "Product unlisted successfully",
            product,
        });
    } catch (error) {
        console.error("Error unlisting product:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while unlisting product",
        });
    }
};


// Re-list a previously unlisted product (only by the seller who created it)

export const listProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.seller.toString() !== sellerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action",
            });
        }

        product.isUnlisted = false;
        await product.save();

        // Invalidate Redis product caches
        await clearCachePattern("products:*");

        return res.status(200).json({
            success: true,
            message: "Product listed successfully on the store",
            product,
        });
    } catch (error) {
        console.error("Error listing product:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while listing product",
        });
    }
};