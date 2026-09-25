import { body, validationResult } from "express-validator";

export const registerUserValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("role")
        .optional()
        .isIn(["seller", "user"])
        .withMessage("Role must be either seller or user"),

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