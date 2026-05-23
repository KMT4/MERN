import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getReportSummary } from "../controllers/reportController";

const router = express.Router();

router.get("/summary", protect, getReportSummary);

export default router;
