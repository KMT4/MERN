import { Response } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";
import AIInsight from "../models/AIInsight";
import { AuthRequest } from "../middleware/authMiddleware";
import genAI from "../config/gemini";

// Helper: gather context data for the AI
const getContextData = async (userId: string) => {
  // Current month summary
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const monthlySummary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const income = monthlySummary.find((s) => s._id === "income")?.total || 0;
  const expenses = monthlySummary.find((s) => s._id === "expense")?.total || 0;

  // Category breakdown (expenses)
  const categoryBreakdown = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: "expense",
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  // Recurring detection (simplified – same as insightController)
  const recurring = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { category: "$category", type: "$type", amount: "$amount" },
        count: { $sum: 1 },
        transactions: { $push: { date: "$date", description: "$description" } },
      },
    },
    { $match: { count: { $gte: 3 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // All transactions (last 12 months) for historical context
  const allTime = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    currentMonth: {
      income,
      expenses,
      savings: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    },
    topExpenseCategories: categoryBreakdown.map((c) => ({
      name: c._id,
      total: c.total,
      percentage: expenses > 0 ? ((c.total / expenses) * 100).toFixed(1) : 0,
    })),
    recurringTransactions: recurring.map((r) => ({
      category: r._id.category,
      type: r._id.type,
      amount: r._id.amount,
      occurrences: r.count,
    })),
    monthlyHistory: allTime, // can be summarised
  };
};

// Generate insights with caching
export const generateFinancialInsights = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const forceRefresh = req.query.force === "true";
    const userId = req.userId as string;

    // Check cache (unless forced)
    if (!forceRefresh) {
      const cached = await AIInsight.findOne({ userId });
      if (
        cached &&
        cached.updatedAt &&
        new Date().getTime() - cached.updatedAt.getTime() < 6 * 60 * 60 * 1000
      ) {
        // Return cached insights
        res.status(200).json({
          success: true,
          insights: cached.insights,
          cached: true,
          generatedAt: cached.updatedAt,
        });
        return;
      }
    }

    // Gather context
    const context = await getContextData(userId);

    // Build structured prompt
    const prompt = `You are a personal financial advisor AI. Analyze the following user data and return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "insights": [
    {
      "type": "warning",        // or "prediction", "tip", "goal"
      "message": "string",
      "category": "string",     // optional
      "severity": "high"|"medium", // optional
      "potentialSaving": number, // optional, only for tip
      "daysLeft": number        // optional, only for prediction
    }
  ]
}

Include up to 5 diverse, actionable insights. Use exactly these type values:
- "warning": alert about overspending, unusual spikes, or nearing budget limits
- "prediction": forecast based on spending patterns (e.g., "you may run out of budget in X days")
- "tip": practical money-saving advice with potential saving amount
- "goal": encouragement or progress update about savings goals

Use the data below. Focus on the current month but also note historical patterns.
User context:
${JSON.stringify(context, null, 2)}

Return ONLY the JSON object.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Robust parsing: strip possible markdown code fences
    let insights: any[];
    try {
      const cleanJson = responseText
        .replace(/```json\s*|\s*```/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanJson);
      insights = parsed.insights || [];
    } catch (parseError) {
      console.error("Failed to parse AI JSON, using fallback", parseError);
      // Fallback: treat entire response as a single tip
      insights = [
        {
          type: "tip",
          message:
            responseText.slice(0, 300) ||
            "We couldn't generate insights right now. Try again later.",
        },
      ];
    }

    // Save to cache
    await AIInsight.findOneAndUpdate(
      { userId },
      {
        userId,
        insights,
        dataSnapshot: context,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    res.status(200).json({
      success: true,
      insights,
      cached: false,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI insights",
    });
  }
};
