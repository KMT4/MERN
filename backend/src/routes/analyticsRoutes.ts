import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getMonthlySummary,
  getCategoryBreakdown,
  getBalance
} from "../controllers/analyticsController";

const router = express.Router();

router.get("/monthly-summary", protect, getMonthlySummary);
router.get("/category-breakdown", protect, getCategoryBreakdown);
router.get("/balance", protect, getBalance);


export default router;