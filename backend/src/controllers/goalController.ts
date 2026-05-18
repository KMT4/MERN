import { Response } from "express";
import Goal from "../models/Goal";
import { AuthRequest } from "../middleware/authMiddleware";



// CREATE GOAL
export const createGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  try {

    const {
      title,
      targetAmount,
      currentAmount,
      deadline
    } = req.body;

    const goal = await Goal.create({
      userId: req.userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal
    });

  } catch (error) {

    console.error("Create Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create goal"
    });

  }

};



// GET USER GOALS
export const getGoals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  try {

    const goals = await Goal.find({
      userId: req.userId
    }).sort({ createdAt: -1 });

    const formattedGoals = goals.map((goal) => {

      const progressPercentage =
        (goal.currentAmount / goal.targetAmount) * 100;

      return {
        _id: goal._id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        remainingAmount:
          goal.targetAmount - goal.currentAmount,
        progressPercentage:
          Number(progressPercentage.toFixed(2)),
        completed:
          goal.currentAmount >= goal.targetAmount,
        deadline: goal.deadline,
        createdAt: goal.createdAt
      };

    });

    res.status(200).json({
      success: true,
      count: formattedGoals.length,
      goals: formattedGoals
    });

  } catch (error) {

    console.error("Get Goals Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch goals"
    });

  }

};



// UPDATE GOAL PROGRESS
export const updateGoalProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  try {

    const { amountToAdd } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {

      res.status(404).json({
        success: false,
        message: "Goal not found"
      });

      return;
    }

    goal.currentAmount += Number(amountToAdd);

    await goal.save();

    const progressPercentage =
      (goal.currentAmount / goal.targetAmount) * 100;

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      goal: {
        _id: goal._id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        remainingAmount:
          goal.targetAmount - goal.currentAmount,
        progressPercentage:
          Number(progressPercentage.toFixed(2)),
        completed:
          goal.currentAmount >= goal.targetAmount
      }
    });

  } catch (error) {

    console.error("Update Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update goal"
    });

  }

};



// DELETE GOAL
export const deleteGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  try {

    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deletedGoal) {

      res.status(404).json({
        success: false,
        message: "Goal not found"
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully"
    });

  } catch (error) {

    console.error("Delete Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete goal"
    });

  }

};