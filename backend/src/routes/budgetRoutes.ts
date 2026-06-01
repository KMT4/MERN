import express from "express";
import {
  createBudget,
  getBudgetStatus,
  getBudgetAlerts,
  updateBudget,
  deleteBudget
} from "../controllers/budgetController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createBudget);
router.get("/status", protect, getBudgetStatus);
router.get("/alerts", protect, getBudgetAlerts);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect,  deleteBudget)
 
export default router;