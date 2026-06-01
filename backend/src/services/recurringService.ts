import mongoose from "mongoose";
import Transaction from "../models/Transaction";

/**
 * Count how many transactions of a given category, type, and amount exist
 * within the last 30 days for a user.
 */
export const countRecentMatchingTransactions = async (
  userId: string,
  category: string,
  type: "income" | "expense",
  amount: number
): Promise<number> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Transaction.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    category,
    type,
    amount,
    date: { $gte: thirtyDaysAgo },
  });
};

/**
 * Set isRecurring = true for all transactions of a user that match
 * category, type, and amount within the last 30 days.
 */
export const markAllAsRecurring = async (
  userId: string,
  category: string,
  type: "income" | "expense",
  amount: number
) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await Transaction.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      category,
      type,
      amount,
      date: { $gte: thirtyDaysAgo },
    },
    { $set: { isRecurring: true } }
  );
};

/**
 * Set isRecurring = false for all transactions of a user that match
 * category, type, and amount within the last 30 days.
 */
export const unmarkAllAsRecurring = async (
  userId: string,
  category: string,
  type: "income" | "expense",
  amount: number
) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await Transaction.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      category,
      type,
      amount,
      date: { $gte: thirtyDaysAgo },
    },
    { $set: { isRecurring: false } }
  );
};

/**
 * Bulk refresh: group by (category, type, amount).
 * Groups with >= 3 occurrences → mark recurring, else unmark.
 */
export const refreshRecurringFlags = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await Transaction.find({
    userId: userObjectId,
    date: { $gte: thirtyDaysAgo },
  })
    .sort({ date: -1 })
    .lean();

  const groups = new Map<string, { count: number; ids: string[] }>();

  for (const tx of transactions) {
    const key = `${tx.category}|${tx.type}|${tx.amount}`;
    if (!groups.has(key)) {
      groups.set(key, { count: 0, ids: [] });
    }
    const group = groups.get(key)!;
    group.count += 1;
    group.ids.push(tx._id.toString());
  }

  let updatedCount = 0;
  for (const [_, group] of groups) {
    const objectIds = group.ids.map(id => new mongoose.Types.ObjectId(id));
    if (group.count >= 3) {
      await Transaction.updateMany(
        { _id: { $in: objectIds } },
        { $set: { isRecurring: true } }
      );
      updatedCount += group.ids.length;
    } else {
      await Transaction.updateMany(
        { _id: { $in: objectIds } },
        { $set: { isRecurring: false } }
      );
    }
  }

  return {
    patternsDetected: groups.size,
    transactionsUpdated: updatedCount,
  };
};