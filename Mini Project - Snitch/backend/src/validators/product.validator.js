import { body, validationResult } from "express-validator";

// Validator for creating a new product

export const createProductValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage("Title must be between 2 and 100 characters long"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .bail()
        .isLength({ min: 10, max: 1000 })
        .withMessage("Description must be between 10 and 1000 characters long"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .bail()
        .isObject()
        .withMessage("Price must be an object containing amount and currency"),

    body("price.amount")
        .notEmpty()
        .withMessage("Price amount is required")
        .bail()
        .isNumeric()
        .withMessage("Price amount must be a number")
        .bail()
        .isFloat({ min: 1, max: 10000000 })
        .withMessage("Price amount must be between 1 and 10,000,000"),

    body("price.currency")
        .optional()
        .isIn(["INR", "USD", "EUR"])
        .withMessage("Price currency must be INR, USD, or EUR"),

    body("sizes")
        .notEmpty()
        .withMessage("Sizes are required")
        .bail()
        .isArray({ min: 1 })
        .withMessage("Sizes must be a non-empty array")
        .bail()
        .custom((sizes) => {
            const validSizes = ["XS", "S", "M", "L", "XL", "XXL"];
            return sizes.every((size) => validSizes.includes(size));
        })
        .withMessage("Invalid size. Allowed sizes are: XS, S, M, L, XL, XXL"),

    body("stock")
        .notEmpty()
        .withMessage("Stock is required")
        .bail()
        .isInt({ min: 0, max: 1000 })
        .withMessage("Stock must be an integer between 0 and 1,000")
        .toInt(),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array")
        .bail()
        .custom((images) => {
            if (images.length > 5) {
                throw new Error("A maximum of 5 images can be stored");
            }
            if (
                !images.every(
                    (img) =>
                        (typeof img === "string" && img.trim().length > 0) ||
                        (typeof img === "object" && img !== null && (img.buffer || img.originalname))
                )
            ) {
                throw new Error("Each image must be a valid image file or non-empty string URL");
            }
            return true;
        }),

    // Validation result handler middleware

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        next();
    },
];

// Validator for updating a product (all fields optional)

export const updateProductValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Title must be between 2 and 100 characters long"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage("Description must be between 10 and 1000 characters long"),

    body("price.amount")
        .optional()
        .isNumeric()
        .withMessage("Price amount must be a number")
        .bail()
        .isFloat({ min: 1, max: 10000000 })
        .withMessage("Price amount must be between 1 and 10,000,000"),

    body("price.currency")
        .optional()
        .isIn(["INR", "USD", "EUR"])
        .withMessage("Price currency must be INR, USD, or EUR"),

    body("sizes")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Sizes must be a non-empty array")
        .bail()
        .custom((sizes) => {
            const validSizes = ["XS", "S", "M", "L", "XL", "XXL"];
            return sizes.every((size) => validSizes.includes(size));
        })
        .withMessage("Invalid size. Allowed sizes are: XS, S, M, L, XL, XXL"),

    body("stock")
        .optional()
        .isInt({ min: 0, max: 1000 })
        .withMessage("Stock must be an integer between 0 and 1,000")
        .toInt(),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array")
        .bail()
        .custom((images) => {
            if (images.length > 5) {
                throw new Error("A maximum of 5 images can be stored");
            }
            if (
                !images.every(
                    (img) =>
                        (typeof img === "string" && img.trim().length > 0) ||
                        (typeof img === "object" && img !== null && (img.buffer || img.originalname))
                )
            ) {
                throw new Error("Each image must be a valid image file or non-empty string URL");
            }
            return true;
        }),

    // Validation result handler middleware

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        next();
    },
];