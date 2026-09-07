import {Router} from "express"
import { registerUser , getMe } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register", registerUser);

authRouter.get("/me" , getMe)

export default authRouter;

