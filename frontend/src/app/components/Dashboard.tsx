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
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Activity,
} from "lucide-react";

import { getTransactions, Transaction } from "../../api/transactions";
import {
  getBalance,
  getMonthlySummary,
  getCategoryBreakdown,
  CategoryBreakdownItem,
} from "../../api/analytics";
import { getInsights, Insight } from "../../api/ai";

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

    months.push({
      month: monthName,
      income,
      expenses,
      savings: income - expenses,
    });
  }

  return months;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  icon: any;
  tone?: "green" | "red" | "amber" | "blue" | "neutral";
}) {
  const toneClass = {
    green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
    red: "bg-red-500/10 text-red-500 ring-red-500/15",
    amber: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
    blue: "bg-blue-500/10 text-blue-500 ring-blue-500/15",
    neutral: "bg-primary/10 text-primary ring-primary/15",
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-muted-foreground">
            {label}
          </p>

          <h3 className="mt-2 truncate text-xl font-semibold tracking-tight text-card-foreground md:text-2xl">
            {value}
          </h3>
        </div>

        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
            toneClass[tone],
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-[310px] animate-pulse rounded-2xl border border-border bg-card xl:col-span-2" />
        <div className="h-[310px] animate-pulse rounded-2xl border border-border bg-card" />
      </div>

      <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
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

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCached, setAiCached] = useState(false);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string>("");

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

      const rate =
        monthIncome > 0
          ? ((monthIncome - monthExpenses) / monthIncome) * 100
          : 0;

      setSavingsRate(rate);

      setCategoryData(
        breakdownRes.map((cat: CategoryBreakdownItem) => ({
          name: cat._id,
          value: cat.total,
          color: categoryColors[cat._id] || "#6B7280",
        })),
      );

      setMonthlyTrend(buildMonthlyTrend(transactionsRes));
      setRecentTransactions(transactionsRes.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchInsights();
  }, [fetchInsights]);

  const expenseRatio =
    monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  const savingsHelper =
    savingsRate >= 20
      ? "Above 20% target"
      : savingsRate >= 0
        ? "Below 20% target"
        : "Spending exceeds income";

  const insightIcons: Record<string, any> = {
    warning: AlertTriangle,
    prediction: TrendingUp,
    tip: Sparkles,
    goal: Target,
  };

  const insightStyles: Record<string, string> = {
    warning: "bg-red-500/10 text-red-500 ring-red-500/15",
    prediction: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
    tip: "bg-blue-500/10 text-blue-500 ring-blue-500/15",
    goal: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Dashboard
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Financial Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Cash flow, spending, savings and AI insights.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={() => fetchInsights(true)}
            disabled={aiLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiLoading ? "Generating" : "AI Insights"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard
              label="Balance"
              value={formatCurrency(balance)}
              helper="All-time net position"
              icon={Wallet}
              tone={balance >= 0 ? "green" : "red"}
            />

            <KpiCard
              label="Income"
              value={formatCurrency(monthlyIncome)}
              helper="Received this month"
              icon={ArrowUpRight}
              tone="green"
            />

            <KpiCard
              label="Expenses"
              value={formatCurrency(monthlyExpenses)}
              helper={
                monthlyIncome > 0
                  ? `${expenseRatio.toFixed(0)}% of income`
                  : "No income data"
              }
              icon={ArrowDownRight}
              tone={expenseRatio > 80 ? "red" : "blue"}
            />

            <KpiCard
              label="Savings Rate"
              value={`${savingsRate.toFixed(0)}%`}
              helper={savingsHelper}
              icon={Target}
              tone={savingsRate >= 20 ? "green" : savingsRate >= 0 ? "amber" : "red"}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <ChartCard
              title="Cash Flow"
              subtitle="Income, expenses and savings over the last 6 months"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={285}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
                      fontSize: "12px",
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--chart-2)"
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Income"
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--chart-1)"
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Expenses"
                  />

                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="var(--chart-4)"
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Categories" subtitle="Where your money goes">
              {categoryData.length === 0 ? (
                <div className="flex h-[285px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-center">
                  <CreditCard className="mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No expenses yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Spending data will appear here.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={285}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    AI Insights
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personalized financial signals
                  </p>
                </div>

                <button
                  onClick={() => fetchInsights(true)}
                  disabled={aiLoading}
                  className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", aiLoading && "animate-spin")}
                  />
                  Refresh
                </button>
              </div>

              {aiCached && !aiLoading && aiGeneratedAt && (
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Updated {new Date(aiGeneratedAt).toLocaleString()}
                </p>
              )}

              {aiLoading ? (
                <div className="rounded-xl border border-border bg-background/50 p-4 text-xs text-muted-foreground">
                  Generating insights...
                </div>
              ) : aiInsights.length > 0 ? (
                <div className="space-y-2">
                  {aiInsights.map((insight, index) => {
                    const Icon = insightIcons[insight.type] || Sparkles;
                    const style =
                      insightStyles[insight.type] ||
                      "bg-primary/10 text-primary ring-primary/15";

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-border/80 bg-background/50 p-3"
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                              style,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs leading-5 text-card-foreground">
                              {insight.message}
                            </p>

                            {insight.potentialSaving && (
                              <p className="mt-1 text-[11px] font-medium text-emerald-500">
                                Save ${insight.potentialSaving}/month
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-5 text-center">
                  <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No insights yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Refresh to generate AI suggestions.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm xl:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Recent Transactions
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Latest account activity
                  </p>
                </div>

                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Last 5
                </span>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center">
                  <CreditCard className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No recent transactions
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Activity will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/80">
                  {recentTransactions.map((txn, index) => {
                    const isIncome = txn.type === "income";

                    return (
                      <div
                        key={txn._id}
                        className={cn(
                          "flex items-center justify-between gap-4 bg-card px-3 py-3 transition-colors hover:bg-accent/50",
                          index !== recentTransactions.length - 1 &&
                            "border-b border-border/80",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 text-red-500",
                            )}
                          >
                            {isIncome ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-card-foreground">
                              {txn.description}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {txn.category} •{" "}
                              {new Date(txn.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p
                          className={cn(
                            "shrink-0 text-sm font-semibold",
                            isIncome ? "text-emerald-500" : "text-foreground",
                          )}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}