import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import User from "./models/User";
import app from "./app";



const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};



startServer();



