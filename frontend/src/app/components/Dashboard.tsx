import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Target,
} from "lucide-react";
import { getTransactions, Transaction } from "../../api/transactions";
import {
  getBalance,
  getMonthlySummary,
  getCategoryBreakdown,
  CategoryBreakdownItem,
} from "../../api/analytics";
import api from "../../api/axios"; // to call AI endpoint directly (or we can add it to insights.ts)

// Colors for the pie chart categories (fallback if not in map)
const categoryColors: Record<string, string> = {
  Housing: "var(--chart-1)",
  Food: "var(--chart-2)",
  Transportation: "var(--chart-3)",
  Entertainment: "var(--chart-4)",
  Utilities: "var(--chart-5)",
  Other: "#9CA3AF",
};

// Helper: build monthly income/expense/savings for last 6 months
function buildMonthlyTrend(transactions: Transaction[]) {
  const months: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString("default", { month: "short" });
    const income = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear(),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear(),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    months.push({
      month: monthName,
      income,
      expenses,
      savings: income - expenses,
    });
  }
  return months;
}

export function Dashboard() {
  // State for all data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Summary cards
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  // Charts
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number; color: string }[]
  >([]);

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  // AI Insights
  const [aiInsightText, setAiInsightText] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch everything in parallel
      const [balanceRes, summaryRes, breakdownRes, transactionsRes] =
        await Promise.all([
          getBalance(),
          getMonthlySummary(),
          getCategoryBreakdown(),
          getTransactions(), // all transactions for monthly trend
        ]);

      // Balance
      setBalance(balanceRes.balance);
      setMonthlyIncome(balanceRes.income);
      const incomeItem = summaryRes.find((s) => s._id === "income");
      const expenseItem = summaryRes.find((s) => s._id === "expense");
      const monthIncome = incomeItem ? incomeItem.total : 0;
      const monthExpenses = expenseItem ? expenseItem.total : 0;
      setMonthlyIncome(monthIncome);
      setMonthlyExpenses(monthExpenses);

      // Savings rate
      const rate =
        monthIncome > 0
          ? ((monthIncome - monthExpenses) / monthIncome) * 100
          : 0;
      setSavingsRate(rate);

      // Category breakdown for pie chart
      const totalExpenses = monthExpenses || 1; // avoid division by zero
      const pieData = breakdownRes.map((cat: CategoryBreakdownItem) => ({
        name: cat._id,
        value: cat.total,
        color: categoryColors[cat._id] || "#6B7280",
      }));
      setCategoryData(pieData);

      // Monthly trend (last 6 months)
      const trend = buildMonthlyTrend(transactionsRes);
      setMonthlyTrend(trend);

      // Recent transactions (last 5)
      setRecentTransactions(transactionsRes.slice(0, 5));

      // AI Insights – fetch separately (already have endpoint)
      try {
        const aiRes = await api.get("/ai/financial-insights");
        if (aiRes.data?.success && aiRes.data?.aiInsights) {
          const text = aiRes.data.aiInsights;
          // Split into bullet points (lines) and filter empty lines
          const lines = text
            .split("\n")
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
          setAiInsightText(lines);
        }
      } catch (aiErr) {
        console.error("AI insights fetch failed", aiErr);
        setAiInsightText([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Derived savings status text
  const savingsStatus =
    savingsRate >= 20 ? "Above target of 20%" : "Below target of 20%";
  const savingsColor = savingsRate >= 20 ? "text-chart-2" : "text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-1">Financial Overview</h2>
        <p className="text-muted-foreground">Track your finances at a glance</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading dashboard...</p>}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Balance</span>
                <DollarSign className="w-5 h-5 text-chart-2" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                ${balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All-time net worth
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Monthly Income</span>
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                ${monthlyIncome.toLocaleString()}
              </div>
              <p className="text-sm text-chart-2 mt-1">This month</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Monthly Expenses</span>
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                ${monthlyExpenses.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {monthlyIncome > 0
                  ? `${((monthlyExpenses / monthlyIncome) * 100).toFixed(0)}% of income`
                  : "N/A"}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Savings Rate</span>
                <Target className="w-5 h-5 text-chart-4" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                {savingsRate.toFixed(0)}%
              </div>
              <p className={`text-sm mt-1 ${savingsColor}`}>{savingsStatus}</p>
            </div>
          </div>

          {/* Charts – Income vs Expenses & Spending by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h3 className="text-card-foreground mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    name="Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-card-foreground mb-4">
                Spending by Category
              </h3>
              {categoryData.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No expenses yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-chart-3/10 to-chart-2/10 border border-chart-3/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-chart-3" />
              <h3 className="text-card-foreground">AI-Powered Insights</h3>
            </div>
            <div className="space-y-3">
              {aiInsightText.length > 0 ? (
                aiInsightText.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-card/50 rounded-lg p-4"
                  >
                    <Sparkles className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                    <p className="text-card-foreground">{line}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No AI insights available at the moment.
                </p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-card-foreground mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          txn.type === "income"
                            ? "bg-chart-2/20"
                            : "bg-chart-1/20"
                        }`}
                      >
                        {txn.type === "income" ? (
                          <TrendingUp className="w-5 h-5 text-chart-2" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-chart-1" />
                        )}
                      </div>
                      <div>
                        <p className="text-card-foreground">
                          {txn.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {txn.category} •{" "}
                          {new Date(txn.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        txn.type === "income"
                          ? "text-chart-2"
                          : "text-card-foreground"
                      }`}
                    >
                      {txn.type === "income" ? "+" : "-"}$
                      {txn.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
