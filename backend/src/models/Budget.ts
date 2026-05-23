import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    category: { type: String, required: true },

    limit: { type: Number, required: true },

    month: { type: String, required: true },

    alertThreshold: { type: Number, default: 0.8 }
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;