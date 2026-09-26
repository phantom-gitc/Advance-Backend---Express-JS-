import express from "express";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken, readRefreshToken } from "../utils/auth.utils.js";
import jwt from "jsonwebtoken";
import Config from "../config/config.js";


// Register controller 

export const registerController = async (req, res) => {
  // Destructure the request body
  const { email, password, name, role } = req.body || {};

  try {
    // Check if user already exists
    const isUserAlreadyExist = await userModel.findOne({ email });

    // if user already exists, return error
    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User already exists with this email address ❌",
        error: [
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      });
    }

    // Hash Password

    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      email,
      password: hashPassword,
      name,
      role,
    });

    // Generate Token 
    const accessToken = createAccessToken({ userId: user._id, role });
    const refreshToken = createRefreshToken({ userId: user._id, role });

    // Hash refresh token before saving to database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // save hashed refresh token in user object
    await userModel.findByIdAndUpdate(user._id, {
      refreshToken: hashedRefreshToken,
    });

    // return response

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken: accessToken,
      },
    });
  } catch (error) {
    // log error
    console.log(error);

    // return error
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Login controller

export const loginController = async (req , res) =>{
  
  const {email , password , } = req.body || {}

  const user = await userModel.findOne({email})

  if(!user) {
    return res.status(400).json({
      message : "Invalid Email or Password ❌",
      error : [
        {
          field : "email",
          message : "Email not found"
        }
      ]
    })
  }

  // compare password

  const isPasswordValid = await bcrypt.compare(password, user.password);

  // if password is not valid

  if(!isPasswordValid){
    return res.status(400).json({
      message : "Invalid Email or Password ❌",
      error : [
        {
          field : "password",
          message : "Invalid password"
        }
      ]
    })
  }

  // generate token
  const accessToken = createAccessToken({userId : user._id , role : user.role})
  const refreshToken = createRefreshToken({userId : user._id , role : user.role})

  // hash refresh token before saving to database
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await userModel.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefreshToken,
  });

  res.cookie("refreshToken" , refreshToken , {
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 1000 * 60 * 60 * 24 * 7,
  })

  return res.status(200).json({
    message : "User logged in successfully",
    data : {
      user : {
        id : user._id,
        email : user.email,
        name : user.name,
        role : user.role,
      },
      accessToken : accessToken,
    },
  })
}


/**
 * Refresh Controller
 * 
 * Purpose:
 * When a user's 15-minute access token expires, the client hits this endpoint
 * using their HTTP-only refresh token cookie to get a new access token without logging in again.
 * 
 * How it works:
 * 1. Grab the refresh token from req.cookies.
 * 2. Verify the JWT signature & expiry.
 * 3. Find the user in DB and compare the token against the stored bcrypt hash.
 * 4. If someone uses an invalid or old token (reuse/theft attack), immediately
 *    reset refreshToken to null in DB, wipe the cookie, and kick them out.
 * 5. If valid, rotate credentials: issue a new access token + new refresh token,
 *    hash the new refresh token in DB, set the new cookie, and return the access token.
 */
export const refreshController = async (req, res) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized ❌",
      error: [
        {
          field: "refreshToken",
          message: "Refresh token not found",
        },
      ],
    });
  }

  try {
    const decodeToken = readRefreshToken(refreshToken);

    if (!decodeToken) {
      return res.status(401).json({
        message: "Unauthorized ❌",
        error: [
          {
            field: "refreshToken",
            message: "Invalid or expired refresh token",
          },
        ],
      });
    }

    const userId = decodeToken.id?.userId || decodeToken.id || decodeToken.userId;
    const user = await userModel.findById(userId);

    if (!user || !user.refreshToken) {
      return res.status(401).json({
        message: "Unauthorized ❌",
        error: [
          {
            field: "refreshToken",
            message: "User not found or session expired",
          },
        ],
      });
    }

    const isTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isTokenMatching) {
      await userModel.findByIdAndUpdate(user._id, { refreshToken: null });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(401).json({
        message: "Unauthorized ❌",
        error: [
          {
            field: "refreshToken",
            message: "Suspicious activity detected. Session revoked. Please log in again.",
          },
        ],
      });
    }

    const newAccessToken = createAccessToken({ userId: user._id, role: user.role });
    const newRefreshToken = createRefreshToken({ userId: user._id, role: user.role });

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await userModel.findByIdAndUpdate(user._id, {
      refreshToken: hashedNewRefreshToken,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};