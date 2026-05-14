import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    lender: { type: String, required: true },

    amountBorrowed: { type: Number, required: true },

    amountRemaining: { type: Number, required: true },

    interestRate: { type: Number },

    dueDate: { type: Date }
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;