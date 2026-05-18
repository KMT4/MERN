import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE TRANSACTION
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, category, description, paymentMethod, isRecurring } =
      req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      isRecurring,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
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
