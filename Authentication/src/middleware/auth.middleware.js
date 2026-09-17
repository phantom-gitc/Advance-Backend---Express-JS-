import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import config from "../config/config.js";



// Middleware to verify access token 
 
export const authenticate = async (req, res, next) => {
  try {

    // Get token from header 

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }


    // Extract token and verify

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.ACCESS_SECRET);

    // Check if user exists 

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }


    // Attach user to request and proceed

    req.user = user;
    next();
    
  } catch (error) { 

    // Handle token expiration
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token has expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};