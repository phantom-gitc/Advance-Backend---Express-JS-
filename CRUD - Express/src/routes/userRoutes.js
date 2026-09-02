import express from "express";
import {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} from "../controllers/userController.js";
import {
    validateCreateUser,
    validateUpdateUser,
    validateId
} from "../middleware/userValidation.js";

const router = express.Router();

// User routes
router.post("/create-user", validateCreateUser, createUser);
router.get("/get-users", getUsers);
router.get("/get-user/:id", validateId, getUser);
router.put("/update-user/:id", validateId, validateUpdateUser, updateUser);
router.delete("/delete-user/:id", validateId, deleteUser);

// REST routes
router.post("/", validateCreateUser, createUser);
router.get("/", getUsers);
router.get("/:id", validateId, getUser);
router.put("/:id", validateId, validateUpdateUser, updateUser);
router.delete("/:id", validateId, deleteUser);

export default router;
