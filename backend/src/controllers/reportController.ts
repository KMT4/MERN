import { Response } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";
import Budget from "../models/Budget";
import Goal from "../models/Goal";
import Loan from "../models/Loan";

import { AuthRequest } from "../middleware/authMiddleware";

export const getReportSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const [transactionTotals, budgetStatus, goals, loans] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Budget.find({ userId }),
      Goal.find({ userId }),
      Loan.find({ userId }),
    ]);

    let income = 0;
    let expense = 0;
    transactionTotals.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    const budgetSummary = budgetStatus.map((budget) => ({
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
    }));

    const goalSummary = goals.map((goal) => ({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      completed: goal.currentAmount >= goal.targetAmount,
    }));

    const loanSummary = {
      totalLoans: loans.length,
      totalBorrowed: loans.reduce((sum, loan) => sum + loan.amountBorrowed, 0),
      totalRemaining: loans.reduce((sum, loan) => sum + loan.amountRemaining, 0),
      overdueLoans: loans.filter(
        (loan) => loan.amountRemaining > 0 && loan.dueDate && loan.dueDate < new Date()
      ).length,
    };

    res.json({
      success: true,
      report: {
        income,
        expense,
        balance: income - expense,
        budgetCount: budgetStatus.length,
        goalCount: goals.length,
        loanCount: loans.length,
        budgets: budgetSummary,
        goals: goalSummary,
        loans: loanSummary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating report summary", error });
  }
};


