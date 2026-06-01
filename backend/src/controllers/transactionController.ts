import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import { classifyTransaction } from "../utils/categoryClassifier";
import {
  countRecentMatchingTransactions,
  markAllAsRecurring,
  unmarkAllAsRecurring,
} from "../services/recurringService";

const buildTransactionPayload = (req: AuthRequest) => {
  const { type, amount, category, description, paymentMethod } = req.body;
  const classification = classifyTransaction(category, description, paymentMethod);

  return {
    type,
    amount,
    category: classification.category,
    description,
    paymentMethod,
    autoCategorized: classification.autoCategorized,
    categoryConfidence: classification.confidence,
  };
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const payload = buildTransactionPayload(req);

    const transaction = await Transaction.create({
      userId: req.userId,
      ...payload,
      isRecurring: false,
    });

    const count = await countRecentMatchingTransactions(
      req.userId as string,
      transaction.category,
      transaction.type as "income" | "expense",
      transaction.amount          // <-- added amount
    );

    if (count >= 3) {
      await markAllAsRecurring(
        req.userId as string,
        transaction.category,
        transaction.type as "income" | "expense",
        transaction.amount          // <-- added amount
      );
      transaction.isRecurring = true;
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error });
  }
};


export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const filter: any = { userId: req.userId };
    if (type === 'income' || type === 'expense') {
      filter.type = type;
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionData = await buildTransactionPayload(req);

    const updated = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      transactionData,
      { new: true },
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const remainingCount = await countRecentMatchingTransactions(
      req.userId as string,
      transaction.category,
      transaction.type as "income" | "expense",
      transaction.amount          // <-- added amount
    );

    if (remainingCount < 3) {
      await unmarkAllAsRecurring(
        req.userId as string,
        transaction.category,
        transaction.type as "income" | "expense",
        transaction.amount          // <-- added amount
      );
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
  }
};