import { body, validationResult } from "express-validator";

// Allowed sizes matching Product & Cart models 

const ALLOWED_SIZES = ["S", "M", "L", "XL", "XXL"];

// Reusable validation result handler middleware

const validateResult = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

// Validator for adding a product to the cart

export const addToCartValidator = [

    body("productId")
        .custom((value, { req }) => {
            const id = value || req.body.product;
            if (!id) {
                throw new Error("Product ID is required");
            }
            const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

            if (!mongoIdRegex.test(id)) {
                throw new Error("Invalid Product ID format");
            }
            return true;
        }),

    body("size")
        .trim()
        .notEmpty()
        .withMessage("Size is required")
        .bail()
        .customSanitizer((val) => (typeof val === "string" ? val.toUpperCase() : val))
        .isIn(ALLOWED_SIZES)
        .withMessage(`Invalid size. Allowed sizes are: ${ALLOWED_SIZES.join(", ")}`),

    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer of at least 1")
        .toInt(),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number")
        .toFloat(),

    validateResult,
];

// Alias for addToCartValidator matching cartValidator


export const cartValidator = addToCartValidator;

// Validator for updating cart item quantity

export const updateCartItemValidator = [
    body("productId")
        .custom((value, { req }) => {
            const id = value || req.body.product;
            if (!id) {
                throw new Error("Product ID is required");
            }
            const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!mongoIdRegex.test(id)) {
                throw new Error("Invalid Product ID format");
            }
            return true;
        }),

    body("size")
        .trim()
        .notEmpty()
        .withMessage("Size is required")
        .bail()
        .customSanitizer((val) => (typeof val === "string" ? val.toUpperCase() : val))
        .isIn(ALLOWED_SIZES)
        .withMessage(`Invalid size. Allowed sizes are: ${ALLOWED_SIZES.join(", ")}`),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .bail()
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer of at least 1")
        .toInt(),

    validateResult,
];

// Validator for removing an item from the cart
export const removeFromCartValidator = [
    body("productId")
        .custom((value, { req }) => {
            const id = value || req.body.product;
            if (!id) {
                throw new Error("Product ID is required");
            }
            const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!mongoIdRegex.test(id)) {
                throw new Error("Invalid Product ID format");
            }
            return true;
        }),

    body("size")
        .trim()
        .notEmpty()
        .withMessage("Size is required")
        .bail()
        .customSanitizer((val) => (typeof val === "string" ? val.toUpperCase() : val))
        .isIn(ALLOWED_SIZES)
        .withMessage(`Invalid size. Allowed sizes are: ${ALLOWED_SIZES.join(", ")}`),

    validateResult,
];

export default cartValidator;
