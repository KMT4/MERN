import express from "express";

import {
  detectRecurringTransactions,
  refreshRecurringTransactions,
  getSpendingInsights,
} from "../controllers/insightController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// DETECT RECURRING TRANSACTIONS
router.get("/recurring-transactions", protect, detectRecurringTransactions);
router.post("/refresh-recurring", protect, refreshRecurringTransactions);

// SPENDING INSIGHTS
router.get("/spending-insights", protect, getSpendingInsights);

export default router;
