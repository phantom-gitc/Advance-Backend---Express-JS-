import {Router} from "express";
import { loginController, registerController, refreshController } from "../controller/auth.controller.js";
import { loginUserValidator, registerUserValidator } from "../validators/auth.validators.js";


const router = Router();



router.post("/register" , registerUserValidator , registerController );

router.post("/login",loginUserValidator , loginController)

router.post("/refresh", refreshController); 


export default router;