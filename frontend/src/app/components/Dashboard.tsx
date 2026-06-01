import { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getTransactions, Transaction } from "../../api/transactions";
import {
  getBalance,
  getMonthlySummary,
  getCategoryBreakdown,
  CategoryBreakdownItem,
} from "../../api/analytics";
import { getInsights, Insight } from "../../api/ai";
import { getCurrencySymbol } from '../../utils/currency';
import { getUserProfile } from "../../api/user";

// Colors for the pie chart categories
const categoryColors: Record<string, string> = {
  Housing: "var(--chart-1)",
  Food: "var(--chart-2)",
  Transportation: "var(--chart-3)",
  Entertainment: "var(--chart-4)",
  Utilities: "var(--chart-5)",
  Other: "#9CA3AF",
};

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
    months.push({ month: monthName, income, expenses, savings: income - expenses });
  }
  return months;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCached, setAiCached] = useState(false);
  const [aiGeneratedAt, setAiGeneratedAt] = useState("");

  const fetchInsights = useCallback(async (force = false) => {
    setAiLoading(true);
    try {
      const res = await getInsights(force);
      setAiInsights(res.insights);
      setAiCached(res.cached);
      setAiGeneratedAt(res.generatedAt);
    } catch (err) {
      console.error("AI insights error", err);
      setAiInsights([]);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchInsights();
    loadCurrency()
  }, [fetchInsights]);

  const insightIcons: Record<string, any> = {
    warning: AlertTriangle,
    prediction: TrendingUp,
    tip: Sparkles,
    goal: Target,
  };
  const insightColors: Record<string, string> = {
    warning: "text-destructive",
    prediction: "text-yellow-500",
    tip: "text-chart-2",
    goal: "text-chart-4",
  };

  const loadCurrency = async () => {
   try{     
    const user = await getUserProfile();
    localStorage.setItem('currency', user.currency || 'USD');
  } catch (err) {
    console.error("Failed to load currency on mount", err);
  }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      
      const [balanceRes, summaryRes, breakdownRes, transactionsRes] =
        await Promise.all([
          getBalance(),
          getMonthlySummary(),
          getCategoryBreakdown(),
          getTransactions(),
        ]);

      setBalance(balanceRes.balance);
      const incomeItem = summaryRes.find((s) => s._id === "income");
      const expenseItem = summaryRes.find((s) => s._id === "expense");
      const monthIncome = incomeItem ? incomeItem.total : 0;
      const monthExpenses = expenseItem ? expenseItem.total : 0;
      setMonthlyIncome(monthIncome);
      setMonthlyExpenses(monthExpenses);

      const rate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;
      setSavingsRate(rate);

      const pieData = breakdownRes.map((cat: CategoryBreakdownItem) => ({
        name: cat._id,
        value: cat.total,
        color: categoryColors[cat._id] || "#6B7280",
      }));
      setCategoryData(pieData);

      setMonthlyTrend(buildMonthlyTrend(transactionsRes));
      setRecentTransactions(transactionsRes.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const savingsStatus =
    savingsRate >= 20 ? "Above target of 20%" : "Below target of 20%";
  const savingsColor = savingsRate >= 20 ? "text-chart-2" : "text-destructive";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Financial Overview
        </h2>
        <p className="text-muted-foreground mt-0.5">
          Track your finances at a glance
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading dashboard...</p>}

      {!loading && (
        <>
          {/* Summary Cards – borderless, subtle ring */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Balance", icon: DollarSign, value: `${getCurrencySymbol()}${balance.toLocaleString()}`, sub: "All-time net worth", iconColor: "text-emerald-500" },
              { label: "Monthly Income", icon: TrendingUp, value: `${getCurrencySymbol()}${monthlyIncome.toLocaleString()}`, sub: "This month", iconColor: "text-emerald-500" },
              { label: "Monthly Expenses", icon: TrendingDown, value: `${getCurrencySymbol()}${monthlyExpenses.toLocaleString()}`, sub: monthlyIncome > 0 ? `${((monthlyExpenses / monthlyIncome) * 100).toFixed(0)}% of income` : "N/A", iconColor: "text-red-500" },
              { label: "Savings Rate", icon: Target, value: `${getCurrencySymbol()}${savingsRate.toFixed(0)}%`, sub: savingsStatus, subColor: savingsColor, iconColor: "text-amber-500" },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </span>
                    <Icon className={`w-5 h-5 ${getCurrencySymbol()}${card.iconColor}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground tracking-tight">
                    {card.value}
                  </div>
                  <p className={`text-xs mt-1.5 ${card.subColor ?? "text-muted-foreground"}`}>
                    {card.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-6">
                Income vs Expenses
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    name="Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    dot={false}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-6">
                Spending by Category
              </h3>
              {categoryData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No expenses yet</p>
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
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Insights – light and clean */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-foreground">
                  AI-Powered Insights
                </h3>
              </div>
              <button
                onClick={() => fetchInsights(true)}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`} />
                {aiLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {aiCached && !aiLoading && (
              <p className="text-xs text-gray-500 mb-4">
                Last updated: {new Date(aiGeneratedAt).toLocaleString()}
              </p>
            )}
            <div className="space-y-3">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => {
                  const Icon = insightIcons[insight.type] || Sparkles;
                  const colorClass = insightColors[insight.type] || "text-blue-600";
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-white/70 rounded-xl p-4 border border-blue-50"
                    >
                      <Icon className={`w-5 h-5 ${colorClass} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm text-foreground">{insight.message}</p>
                        {insight.potentialSaving && (
                          <p className="text-xs font-medium text-emerald-600 mt-1">
                            Potential saving: {getCurrencySymbol()}{insight.potentialSaving}/month
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : !aiLoading ? (
                <p className="text-sm text-gray-500">
                  No insights available. Click Refresh to generate.
                </p>
              ) : (
                <p className="text-sm text-gray-500">Generating insights...</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-5">
              Recent Transactions
            </h3>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          txn.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {txn.type === "income" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {txn.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {txn.category} •{" "}
                          {new Date(txn.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        txn.type === "income"
                          ? "text-emerald-600"
                          : "text-foreground"
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