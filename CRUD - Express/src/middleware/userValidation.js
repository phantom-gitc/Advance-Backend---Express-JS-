import mongoose from "mongoose";

// Validate data before creating a user
export const validateCreateUser = (req, res, next) => {
    const { name, email, age } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({
            success: false,
            message: "Valid email is required"
        });
    }

    if (age === undefined || isNaN(Number(age)) || Number(age) < 1) {
        return res.status(400).json({
            success: false,
            message: "Valid age is required"
        });
    }

    // Trim inputs
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.age = Number(age);

    next();
};

// Validate data before updating a user
export const validateUpdateUser = (req, res, next) => {
    const { name, email, age } = req.body;

    // Check if at least one field is provided
    if (!name && !email && age === undefined) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one field to update"
        });
    }

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }
        req.body.name = name.trim();
    }

    if (email !== undefined) {
        if (typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Valid email is required"
            });
        }
        req.body.email = email.trim().toLowerCase();
    }

    if (age !== undefined) {
        if (isNaN(Number(age)) || Number(age) < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid age is required"
            });
        }
        req.body.age = Number(age);
    }

    next();
};

// Check if mongo id in params is valid
export const validateId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    next();
};

// Keep validateObjectId as alias for compatibility
export const validateObjectId = validateId;
