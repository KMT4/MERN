import { Response } from "express";
import Budget from "../models/Budget";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

// CREATE BUDGET
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { category, limit, month, alertThreshold } = req.body;

    const budget = await Budget.create({
      userId: req.userId,
      category,
      limit,
      month,
      alertThreshold: alertThreshold ?? 0.8,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({
      message: "Error creating budget",
      error,
    });
  }
};

export const getBudgetStatus = async (req: AuthRequest, res: Response) => {
  //Find all expense transactions in that category
  // sum them
  // compare with budget limit

  try {
    const budgets = await Budget.find({
      userId: req.userId,
    });

    const results = [];

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.userId),
            category: budget.category,
            type: "expense",
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" },
          },
        },
      ]);

      const totalSpent = spent[0]?.totalSpent || 0;

      const thresholdAmount = budget.limit * (budget.alertThreshold ?? 0.8);
      const exceeded = totalSpent > budget.limit;
      const nearLimit = totalSpent >= thresholdAmount && !exceeded;

      results.push({
        category: budget.category,
        limit: budget.limit,
        spent: totalSpent,
        remaining: budget.limit - totalSpent,
        exceeded,
        alertThreshold: budget.alertThreshold ?? 0.8,
        thresholdAmount,
        nearLimit,
        alertTriggered: exceeded || nearLimit,
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching budget status",
      error,
    });
  }
};

export const getBudgetAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await Budget.find({
      userId: req.userId,
    });

    const alerts = [];

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.userId),
            category: budget.category,
            type: "expense",
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" },
          },
        },
      ]);

      const totalSpent = spent[0]?.totalSpent || 0;
      const thresholdAmount = budget.limit * (budget.alertThreshold ?? 0.8);
      const exceeded = totalSpent > budget.limit;
      const nearLimit = totalSpent >= thresholdAmount && !exceeded;

      if (exceeded || nearLimit) {
        alerts.push({
          category: budget.category,
          limit: budget.limit,
          spent: totalSpent,
          exceeded,
          nearLimit,
          alertThreshold: budget.alertThreshold ?? 0.8,
          thresholdAmount,
        });
      }
    }

    res.json({ success: true, alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching budget alerts",
      error,
    });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { category, limit, month, alertThreshold } = req.body;

    const updatedBudget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        ...(category !== undefined && { category }),
        ...(limit !== undefined && { limit }),
        ...(month !== undefined && { month }),
        ...(alertThreshold !== undefined && { alertThreshold }),
      },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ success: true, budget: updatedBudget });
  } catch (error) {
    res.status(500).json({ message: "Error updating budget", error });
  }
};
