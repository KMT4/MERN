import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import { classifyTransaction } from "../utils/categoryClassifier";
import { findRecurringScore } from "../services/recurringService";

const buildTransactionPayload = async (req: AuthRequest) => {
  const { type, amount, category, description, paymentMethod, isRecurring } = req.body;

  const classification = classifyTransaction(category, description, paymentMethod);
  const recurring = isRecurring ?? await findRecurringScore(
    req.userId as string,
    classification.category,
    type,
    amount,
    paymentMethod,
  );

  return {
    type,
    amount,
    category: classification.category,
    description,
    paymentMethod,
    autoCategorized: classification.autoCategorized,
    categoryConfidence: classification.confidence,
    isRecurring: recurring,
  };
};


export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionData = await buildTransactionPayload(req);

    const transaction = await Transaction.create({
      userId: req.userId,
      ...transactionData,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query; // optional filter by type

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
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
  }
};
