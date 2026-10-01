import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createProduct } from "../controller/product.controller.js";
import multer from "multer";
import { createProductValidator } from "../validators/product.validator.js";

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 5, // Maximum 5 files
    },
    fileFilter,
});

const router = Router();

router.post(
    "/",
    authenticate,
    (req, res, next) => {
        if (req.user.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action",
            });
        }
        next();
    },
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
                            req.body.price = { amount: num, currency: "INR" };
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

            req.body.images = req.files;
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

export default router;