import {Router} from "express"
import { registerUser , getMe  , loginUser} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";


const authRouter = Router();

authRouter.post("/register", registerUser);


authRouter.post("/login" ,loginUser)

authRouter.get("/me" ,authenticate, getMe)

export default authRouter;

