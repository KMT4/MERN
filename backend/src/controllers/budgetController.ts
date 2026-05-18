import { Response } from "express";
import Budget from "../models/Budget";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

// CREATE BUDGET
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { category, limit, month } = req.body;

    const budget = await Budget.create({
      userId: req.userId,
      category,
      limit,
      month,
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

      results.push({
        category: budget.category,
        limit: budget.limit,
        spent: totalSpent,
        remaining: budget.limit - totalSpent,
        exceeded: totalSpent > budget.limit,
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
