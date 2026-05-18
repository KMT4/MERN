import express from "express";
import {
  createBudget,
  getBudgetStatus
} from "../controllers/budgetController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createBudget);
router.get("/status", protect, getBudgetStatus);

export default router;