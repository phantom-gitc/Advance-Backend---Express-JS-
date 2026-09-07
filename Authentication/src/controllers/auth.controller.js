import userModel from "../models/user.model.js";
import config from "../config/config.js";
import jwt from "jsonwebtoken";

// Register controller

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    const user = await userModel.create({ name, email, password });

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


// Get Me router 

export const getMe = async (req , res )=>{
  const authHeader = req.headers.authorization;

  console.log(authHeader);

  const data = jwt.decode(authHeader);

  console.log(data);

  const user = await userModel.findById(data.id);

  console.log(user);
  
  


  
}