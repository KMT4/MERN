import { Response } from "express";
import mongoose from "mongoose";

import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";

import genAI from "../config/gemini";

export const generateFinancialInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const spendingData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const totalExpenses = spendingData.reduce(
      (acc, item) => acc + item.totalSpent,
      0
    );

    const prompt = `
You are a financial advisor AI.

Analyze this spending data:

${JSON.stringify(spendingData, null, 2)}

Total expenses: ₦${totalExpenses}

Give:
- spending habits
- risks
- savings advice
- improvements
- short actionable insights

Keep it simple and clear.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    });

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      analytics: {
        totalExpenses,
        spendingData,
      },
      aiInsights: text,
    });
  } catch (error) {
    console.error("Gemini AI Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI insights",
    });
  }
};