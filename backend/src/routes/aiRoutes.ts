import express from "express";

import {
  generateFinancialInsights
} from "../controllers/aiController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();


// GENERATE AI INSIGHTS
router.get(
  "/financial-insights",
  protect,
  generateFinancialInsights
);


export default router;