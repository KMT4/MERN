import { Response } from "express";
import mongoose from "mongoose";

import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import { refreshRecurringFlags } from "../services/recurringService";

// DETECT RECURRING TRANSACTIONS
export const detectRecurringTransactions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const recurringTransactions = await Transaction.aggregate([
      // Match current user's transactions
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
        },
      },

      // Group transactions
      {
        $group: {
          _id: {
            category: "$category",
            amount: "$amount",
            type: "$type",
          },

          count: { $sum: 1 },

          transactions: {
            $push: {
              date: "$date",
              description: "$description",
              paymentMethod: "$paymentMethod",
            },
          },
        },
      },

      // Only repeated transactions
      {
        $match: {
          count: { $gte: 3 },
        },
      },

      // Sort most recurring first
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const formattedInsights = recurringTransactions.map((item) => {
      return {
        category: item._id.category,
        type: item._id.type,
        amount: item._id.amount,

        recurrenceCount: item.count,

        likelyRecurring: item.count >= 3,

        transactions: item.transactions,
      };
    });

    res.status(200).json({
      success: true,
      recurringPatternsFound: formattedInsights.length,
      insights: formattedInsights,
    });
  } catch (error) {
    console.error("Recurring Detection Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to detect recurring transactions",
    });
  }
};

export const refreshRecurringTransactions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await refreshRecurringFlags(req.userId as string);

    res.status(200).json({
      success: true,
      message: "Recurring transaction flags refreshed",
      ...result,
    });
  } catch (error) {
    console.error("Refresh Recurring Transactions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh recurring transactions",
    });
  }
};

// SPENDING INSIGHTS SUMMARY
export const getSpendingInsights = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const topSpendingCategories = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
        },
      },

      {
        $group: {
          _id: "$category",
          totalSpent: {
            $sum: "$amount",
          },

          transactionCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalSpent: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    const totalExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
        },
      },

      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const highestExpenseCategory = topSpendingCategories[0] || null;

    res.status(200).json({
      success: true,

      summary: {
        totalExpenses: totalExpenses[0]?.total || 0,

        topSpendingCategory: highestExpenseCategory?._id || null,

        topCategoryAmount: highestExpenseCategory?.totalSpent || 0,
      },

      topSpendingCategories,
    });
  } catch (error) {
    console.error("Spending Insights Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate spending insights",
    });
  }
};
