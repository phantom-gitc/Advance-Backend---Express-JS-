import {Router} from "express";
import { loginController, registerController, refreshController, getMe, logoutController } from "../controller/auth.controller.js";
import { loginUserValidator, registerUserValidator } from "../validators/auth.validators.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";


const router = Router();



router.post("/register", authLimiter, registerUserValidator, registerController);

router.post("/login", authLimiter, loginUserValidator, loginController);

router.post("/refresh", refreshController); 

router.post("/logout", logoutController);

router.get("/me" ,authenticate,getMe);


export default router;