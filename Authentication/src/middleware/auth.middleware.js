import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js";
import config from "../config/config.js"

export const authenticate = async (req , res , next)=>{

    const token = req.headers.authorization;


    if(!token){
       return res.status(401).json({
        message : "Token Not Found "
       })
    }

    const data = jwt.verify(token ,config.JWT_SECRET);

    const user = await userModel.findById(data.id);

    req.user = user 
  
    next()


}