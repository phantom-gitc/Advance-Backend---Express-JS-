import userModel from "../models/user.model.js";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// Register controller

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    const user = await userModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        email,
        name,
        id: user._id,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login user

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password Provided

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password are required",
    });
  }

  try {
    // Find the user

    const user = await userModel.findOne({ email });

    const isValidPassword = bcrypt.compare(password, user.password);

    if (!user || !isValidPassword) {
      return res.status(400).json({
        message: "Invalid user and Password..",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
    );

    return res.status(200).json(
      {
        message: "User Loggin successfully .",
        data: {
          user: {
            email: user.email,
            name: user.name,
          },
        },
      },
      token,
    );
  } catch (error) {
    // return res.status()
  }
};

// Get Me router

export const getMe = async (req, res) => {
  console.log(req.user);

  return res.status(200).json({
    user: req.user,
  });
};
