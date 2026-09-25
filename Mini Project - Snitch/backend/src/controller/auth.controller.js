import express from "express";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import {
    createAccessToken,
    createRefreshToken
} from "../utils/auth.utils.js";

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
    const user = await userModel.create({ email, password: hashPassword, name, role });

    // Generate Token 
    const accessToken = createAccessToken({ userId: user._id, role });
    const refreshToken = createRefreshToken({ userId: user._id, role });


    // set refresh token in cookie

    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    // return response

    return res.status(201).json({
      message: "User registered successfully",
      data : {
        user:{
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken: accessToken,
      }
    });

  } catch (error) {
    // log error
    console.log(error);

    // return error
    return res.status(500).json({ message: "Internal server error" });
  }
};
