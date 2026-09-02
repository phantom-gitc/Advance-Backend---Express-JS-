import { user } from "../models/userModel.js";

// Create a new user
export const createUser = async (req, res, next) => {
    try {
        const { name, email, age } = req.body;

        // Check if email already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const newUser = await user.create({ name, email, age });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        next(error);
    }
};

// Get all users
export const getUsers = async (req, res, next) => {
    try {
        const allUsers = await user.find();

        res.status(200).json({
            success: true,
            count: allUsers.length,
            data: allUsers
        });
    } catch (error) {
        next(error);
    }
};

// Get single user by id
export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foundUser = await user.findById(id);

        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: foundUser
        });
    } catch (error) {
        next(error);
    }
};

// Update user by id
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, age } = req.body;

        // Check if email is being updated to an email already in use
        if (email) {
            const existingUser = await user.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        const updatedUser = await user.findByIdAndUpdate(
            id,
            { name, email, age },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// Alias for backwards compatibility
export const updateUsers = updateUser;

// Delete user by id
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await user.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};