import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const sanitizeUser = (user: any) => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.passwordHash;
  return sanitized;
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, currency, monthlyIncome } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId },
      {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(currency !== undefined && { currency }),
        ...(monthlyIncome !== undefined && { monthlyIncome }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

export const changeUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error });
  }
};
