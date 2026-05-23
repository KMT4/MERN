import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.patch("/profile", protect, updateUserProfile);
router.patch("/profile/password", protect, changeUserPassword);

export default router;
