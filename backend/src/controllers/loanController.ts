import { Response } from "express";
import Loan from "../models/Loan";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

export const createLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { lender, amountBorrowed, interestRate, dueDate } = req.body;

    const loan = await Loan.create({
      userId: req.userId,
      lender,
      amountBorrowed,
      amountRemaining: amountBorrowed,
      interestRate,
      dueDate,
    });

    res.status(201).json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ message: "Error creating loan", error });
  }
};

export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ userId: req.userId }).sort({ dueDate: 1 });
    res.json({ success: true, count: loans.length, loans });
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error });
  }
};

export const updateLoan = async (req: AuthRequest, res: Response) => {
  try {
    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json({ success: true, loan: updatedLoan });
  } catch (error) {
    res.status(500).json({ message: "Error updating loan", error });
  }
};

export const deleteLoan = async (req: AuthRequest, res: Response) => {
  try {
    const deletedLoan = await Loan.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json({ success: true, message: "Loan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting loan", error });
  }
};

export const getLoanSummary = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ userId: req.userId });
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amountBorrowed, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.amountRemaining, 0);
    const overdue = loans.filter(
      (loan) => loan.amountRemaining > 0 && loan.dueDate && loan.dueDate < new Date()
    ).length;

    res.json({
      success: true,
      summary: {
        totalBorrowed,
        totalRemaining,
        outstandingLoans: loans.length,
        overdueLoans: overdue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan summary", error });
  }
};
