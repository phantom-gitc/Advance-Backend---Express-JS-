import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { cartValidator } from "../validators/cart.validator.js";
import { addToCart, getCart } from "../controller/cart.controller.js";

const router = Router();

router.post("/", authenticate, cartValidator, addToCart);

router.get("/", authenticate, getCart);

export default router;


