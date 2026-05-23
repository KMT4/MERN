import mongoose from "mongoose";
import Transaction from "../models/Transaction";

export const findRecurringScore = async (
  userId: string,
  category: string,
  type: "income" | "expense",
  amount: number,
  paymentMethod?: string
): Promise<boolean> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const timeframe = new Date();
  timeframe.setMonth(timeframe.getMonth() - 3);

  const matchingCount = await Transaction.countDocuments({
    userId: userObjectId,
    category,
    type,
    paymentMethod,
    amount,
    date: { $gte: timeframe },
  });

  return matchingCount >= 2;
};

export const refreshRecurringFlags = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const recurringGroups = await Transaction.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: {
          category: "$category",
          type: "$type",
          paymentMethod: "$paymentMethod",
          amount: "$amount",
        },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    { $match: { count: { $gte: 3 } } },
  ]);

  const recurringIds = recurringGroups.flatMap((group) => group.ids);
  const updateResult = await Transaction.updateMany(
    { _id: { $in: recurringIds } },
    { $set: { isRecurring: true } }
  );

  return {
    patternsDetected: recurringGroups.length,
    transactionsUpdated: updateResult.modifiedCount || 0,
  };
};
