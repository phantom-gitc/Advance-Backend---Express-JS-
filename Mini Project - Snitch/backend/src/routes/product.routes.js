import { Router } from "express";
import { authenticate, authorizeSeller, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { writeLimiter } from "../middleware/rateLimiter.middleware.js";
import {
    createProduct,
    getAllProducts,
    getProductById,
    getSellerProducts,
    unlistProduct,
    listProduct,
} from "../controller/product.controller.js";
import multer from "multer";
import { createProductValidator } from "../validators/product.validator.js";

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Define upload middleware with file size and count limits for product images

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 5, // Maximum 5 files
    },
    fileFilter,
});
 
const router = Router();

// Create a product  
    
router.post(
    "/",
    writeLimiter,
    authenticate,
    authorizeSeller,
    upload.array("images", 5),
    (req, res, next) => {
        try {
            const { price, discountPercentage, stock, sizes } = req.body;

            if (price) {
                if (typeof price === "string") {
                    try {
                        req.body.price = JSON.parse(price);
                    } catch {
                        const num = Number(price);
                        if (!isNaN(num)) {
                            req.body.price = { amount: num, currency: "USD" };
                        }
                    }
                }
            }

            if (discountPercentage !== undefined && discountPercentage !== "") {
                if (typeof discountPercentage === "string") {
                    try {
                        req.body.discountPercentage = JSON.parse(discountPercentage);
                    } catch {
                        req.body.discountPercentage = Number(discountPercentage);
                    }
                }
            }

            if (stock !== undefined && stock !== "") {
                if (typeof stock === "string") {
                    try {
                        req.body.stock = JSON.parse(stock);
                    } catch {
                        req.body.stock = Number(stock);
                    }
                }
            }

            if (sizes) {
                if (typeof sizes === "string") {
                    try {
                        req.body.sizes = JSON.parse(sizes);
                    } catch {
                        req.body.sizes = sizes.split(",").map((s) => s.trim());
                    }
                }
            }

            if (req.body.category && typeof req.body.category === "string") {
                req.body.category = req.body.category.trim();
            }
            if (req.body.subCategory && typeof req.body.subCategory === "string") {
                req.body.subCategory = req.body.subCategory.trim();
            }

            const bodyImages = Array.isArray(req.body.images)
                ? req.body.images
                : req.body.images
                ? [req.body.images]
                : [];
            req.body.images = [...(req.files || []), ...bodyImages];
            req.body.seller = req.user.userId;

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid request payload format",
                error: error.message,
            });
        }
    },
    createProductValidator, createProduct
);

// Seller dashboard: A seller can list/view all their products on the dashboard (Requirement 8)
router.get("/seller/dashboard", authenticate, authorizeSeller, getSellerProducts);

// Read all the products from the DB (public catalog with optional user authentication)
router.get("/", optionalAuthenticate, getAllProducts);

// Read a single product by ID (public view with size availability)
router.get("/:id", optionalAuthenticate, getProductById);

// Unlist a product (Requirement 7)
router.patch("/unlist/:id", authenticate, authorizeSeller, unlistProduct);

// Re-list a product
router.patch("/list/:id", authenticate, authorizeSeller, listProduct);

export default router;