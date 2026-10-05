import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    cartValidator,
    updateCartItemValidator,
    removeFromCartValidator,
} from "../validators/cart.validator.js";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controller/cart.controller.js";

const router = Router();

router.post("/", authenticate, cartValidator, addToCart);

router.get("/", authenticate, getCart);

router.patch("/item", authenticate, updateCartItemValidator, updateCartItem);

router.delete("/item", authenticate, removeFromCartValidator, removeFromCart);

router.delete("/", authenticate, clearCart);

export default router;


