import express from "express";
import {
  changePassword,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", authMiddleware, getUser);
router.put("/change-password/:id?", authMiddleware, changePassword);
router.put("/:id", authMiddleware, updateUser);

export default router;
