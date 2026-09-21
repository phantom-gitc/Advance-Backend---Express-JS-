import userModel from "../models/user.model.js";

export async function registerUser(req, res) {
  try {
    const { email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const newUser = await userModel.create({
      email,
      password,
      phone
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
