import express from "express";
import {
  createLoan,
  getLoans,
  updateLoan,
  deleteLoan,
  getLoanSummary,
} from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createLoan);
router.get("/", protect, getLoans);
router.get("/summary", protect, getLoanSummary);
router.put("/:id", protect, updateLoan);
router.delete("/:id", protect, deleteLoan);

export default router;
