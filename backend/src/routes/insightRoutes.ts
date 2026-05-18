import express from "express";

import {
  detectRecurringTransactions,
  getSpendingInsights,
} from "../controllers/insightController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// DETECT RECURRING TRANSACTIONS
router.get("/recurring-transactions", protect, detectRecurringTransactions);

// SPENDING INSIGHTS
router.get("/spending-insights", protect, getSpendingInsights);

export default router;
