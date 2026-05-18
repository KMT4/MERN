import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

export const getMonthlySummary = async (req: AuthRequest, res: Response) => {
  try {
   

    const summary = await Transaction.aggregate([
      {
        $match: {
            userId: new mongoose.Types.ObjectId(req.userId),
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json(summary);

  } catch (error) {
    res.status(500).json({ message: "Error generating summary", error });
  }
};

export const getCategoryBreakdown = async (req: AuthRequest, res: Response) => {
    try {
      const breakdown = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.userId),
            type: "expense"
          }
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);
  
      res.json(breakdown);
  
    } catch (error) {
      res.status(500).json({ message: "Error generating breakdown", error });
    }
  };

  export const getBalance = async (req: AuthRequest, res: Response) => {
    try {
  
      const result = await Transaction.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(req.userId), }
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" }
          }
        }
      ]);
  
      let income = 0;
      let expense = 0;
  
      result.forEach((item) => {
        if (item._id === "income") income = item.total;
        if (item._id === "expense") expense = item.total;
      });
  
      res.json({
        income,
        expense,
        balance: income - expense
      });
  
    } catch (error) {
      res.status(500).json({ message: "Error calculating balance", error });
    }
  };