import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import goalRoutes from "./routes/goalRoutes";
import insightRoutes from "./routes/insightRoutes";
import aiRoutes from "./routes/aiRoutes"

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Finance API running...");
});

export default app;