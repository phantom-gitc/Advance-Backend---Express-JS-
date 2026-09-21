import { Router } from "express";
import { registerUser } from "../controller/auth.controller.js";
import { registerValidationRules, validate } from "../middlewares/auth.validator.js";

const router = Router();

router.post("/register", registerValidationRules, validate, registerUser);

export default router;