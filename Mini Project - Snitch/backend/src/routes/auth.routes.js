import {Router} from "express";
import { registerController } from "../controller/auth.controller.js";
import { registerUserValidator } from "../validators/auth.validators.js";


const router = Router();



router.post("/register" , registerUserValidator , registerController );


export default router;