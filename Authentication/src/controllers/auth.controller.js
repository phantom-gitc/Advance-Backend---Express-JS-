import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import config from "../config/config.js";
import {
  generateTokens,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/auth.js";

// Register 

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Check if password is correct 

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database

    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token cookie 

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Refresh token

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, config.REFRESH_SECRET);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({
        message: "Refresh token is invalid or expired",
      });
    }

    const user = await userModel
      .findById(decoded.id)
      .select("+refreshToken");

    if (!user || user.refreshToken !== incomingRefreshToken) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({
        message: "Refresh token has been revoked or is invalid",
      });
    }

    // Token rotation: generate new access & refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken) {
      const decoded = jwt.decode(incomingRefreshToken);
      if (decoded?.id) {
        await userModel.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Current logged in user
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
