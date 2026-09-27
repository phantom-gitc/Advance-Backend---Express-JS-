import {Router} from "express";
import { loginController, registerController, refreshController, getMe } from "../controller/auth.controller.js";
import { loginUserValidator, registerUserValidator } from "../validators/auth.validators.js";
import { authenticate } from "../middleware/auth.middleware.js";


const router = Router();



router.post("/register" , registerUserValidator , registerController );

router.post("/login",loginUserValidator , loginController)

router.post("/refresh", refreshController); 

router.get("/me" ,authenticate,getMe)


export default router;