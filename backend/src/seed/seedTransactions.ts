import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User";
import Transaction from "../models/Transaction";

dotenv.config();



const seedTransactions = async (): Promise<void> => {

  try {

   await mongoose.connect(process.env.MONGO_URI as string)

    console.log("Connected to database");



    // Find first user
    const user = await User.findOne();

    if (!user) {

      console.log("No user found");
      process.exit(1);

    }



    // Clear existing transactions
    await Transaction.deleteMany({
      userId: user._id
    });

    console.log("Old transactions cleared");



    const transactions = [

      // =========================
      // RECURRING NETFLIX
      // =========================

      {
        userId: user._id,
        type: "expense",
        amount: 5000,
        category: "Entertainment",
        description: "Netflix Subscription",
        paymentMethod: "Card",
        isRecurring: true,
        date: new Date("2026-01-05")
      },

      {
        userId: user._id,
        type: "expense",
        amount: 5000,
        category: "Entertainment",
        description: "Netflix Subscription",
        paymentMethod: "Card",
        isRecurring: true,
        date: new Date("2026-02-05")
      },

      {
        userId: user._id,
        type: "expense",
        amount: 5000,
        category: "Entertainment",
        description: "Netflix Subscription",
        paymentMethod: "Card",
        isRecurring: true,
        date: new Date("2026-03-05")
      },



      // =========================
      // RECURRING SALARY
      // =========================

      {
        userId: user._id,
        type: "income",
        amount: 250000,
        category: "Salary",
        description: "Monthly Salary",
        paymentMethod: "Bank Transfer",
        isRecurring: true,
        date: new Date("2026-01-28")
      },

      {
        userId: user._id,
        type: "income",
        amount: 250000,
        category: "Salary",
        description: "Monthly Salary",
        paymentMethod: "Bank Transfer",
        isRecurring: true,
        date: new Date("2026-02-28")
      },

      {
        userId: user._id,
        type: "income",
        amount: 250000,
        category: "Salary",
        description: "Monthly Salary",
        paymentMethod: "Bank Transfer",
        isRecurring: true,
        date: new Date("2026-03-28")
      },



      // =========================
      // FOOD EXPENSES
      // =========================

      {
        userId: user._id,
        type: "expense",
        amount: 12000,
        category: "Food",
        description: "Restaurant",
        paymentMethod: "Cash",
        isRecurring: false,
        date: new Date("2026-03-10")
      },

      {
        userId: user._id,
        type: "expense",
        amount: 8500,
        category: "Food",
        description: "Groceries",
        paymentMethod: "Card",
        isRecurring: false,
        date: new Date("2026-03-14")
      },



      // =========================
      // TRANSPORT
      // =========================

      {
        userId: user._id,
        type: "expense",
        amount: 3000,
        category: "Transport",
        description: "Fuel",
        paymentMethod: "Cash",
        isRecurring: false,
        date: new Date("2026-03-08")
      },

      {
        userId: user._id,
        type: "expense",
        amount: 3000,
        category: "Transport",
        description: "Fuel",
        paymentMethod: "Cash",
        isRecurring: false,
        date: new Date("2026-03-15")
      },

      {
        userId: user._id,
        type: "expense",
        amount: 3000,
        category: "Transport",
        description: "Fuel",
        paymentMethod: "Cash",
        isRecurring: false,
        date: new Date("2026-03-22")
      }

    ];



    await Transaction.insertMany(transactions);

    console.log("Transactions seeded successfully");

    process.exit(0);

  } catch (error) {

    console.error("Seed Error:", error);

    process.exit(1);

  }

};



seedTransactions();