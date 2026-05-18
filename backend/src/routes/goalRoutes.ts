import express from "express";

import {
  createGoal,
  getGoals,
  updateGoalProgress,
  deleteGoal
} from "../controllers/goalController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();


// CREATE GOAL
router.post("/", protect, createGoal);


// GET ALL GOALS
router.get("/", protect, getGoals);


// UPDATE GOAL PROGRESS
router.patch("/:id/progress", protect, updateGoalProgress);


// DELETE GOAL
router.delete("/:id", protect, deleteGoal);


export default router;