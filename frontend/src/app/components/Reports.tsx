import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  Printer,
  Sparkles,
  Activity,
  Percent,
  WalletCards,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { getTransactions, Transaction } from "../../api/transactions";
import { getInsights } from "../../api/ai";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const categoryColors: Record<string, string> = {
  Housing: "var(--chart-1)",
  Food: "var(--chart-2)",
  Transportation: "var(--chart-3)",
  Entertainment: "var(--chart-4)",
  Utilities: "var(--chart-5)",
  Other: "#9CA3AF",
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#9CA3AF",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const formatCurrency = (n: number) =>
  "$" +
  n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

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
  tone?: "green" | "red" | "blue" | "amber" | "neutral";
}) {
  const toneClass = {
    green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
    red: "bg-red-500/10 text-red-500 ring-red-500/15",
    blue: "bg-blue-500/10 text-blue-500 ring-blue-500/15",
    amber: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
    neutral: "bg-primary/10 text-primary ring-primary/15",
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
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
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {right}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}

export function Reports() {
  const reportRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

  const [startDate, setStartDate] = useState(
    sixMonthsAgo.toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const allTxns = await getTransactions();
      setTransactions(allTxns);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    setAiLoading(true);

    try {
      const res = await getInsights();
      setAiSummary(res.insights.map((i) => i.message).join(" "));
    } catch {
      setAiSummary("AI summary unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
    fetchAiSummary();
  }, []);

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= start && d <= end;
  });

  const incomes = filtered.filter((tx) => tx.type === "income");
  const expenses = filtered.filter((tx) => tx.type === "expense");

  const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const categoryMap = new Map<string, number>();
  expenses.forEach((tx) => {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  });

  const categoryBreakdown = Array.from(categoryMap, ([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#6B7280",
  })).sort((a, b) => b.value - a.value);

  const incomeSourceMap = new Map<string, number>();
  incomes.forEach((tx) => {
    incomeSourceMap.set(tx.category, (incomeSourceMap.get(tx.category) || 0) + tx.amount);
  });

  const incomeSources = Array.from(incomeSourceMap, ([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const trendMap = new Map<string, { income: number; expenses: number }>();

  filtered.forEach((tx) => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const entry = trendMap.get(key) || { income: 0, expenses: 0 };

    if (tx.type === "income") {
      entry.income += tx.amount;
    } else {
      entry.expenses += tx.amount;
    }

    trendMap.set(key, entry);
  });

  const monthlyTrend = Array.from(trendMap, ([key, val]) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);

    return {
      key,
      month: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      income: val.income,
      expenses: val.expenses,
      net: val.income - val.expenses,
    };
  }).sort((a, b) => a.key.localeCompare(b.key));

  let cumBalance = 0;

  const cashFlow = monthlyTrend.map((m) => {
    cumBalance += m.net;
    return {
      ...m,
      cumulative: cumBalance,
    };
  });

  const numMonths = cashFlow.length || 1;

  const metrics = [
    {
      label: "Avg. Monthly Income",
      value: formatCurrency(totalIncome / numMonths),
    },
    {
      label: "Avg. Monthly Expenses",
      value: formatCurrency(totalExpenses / numMonths),
    },
    {
      label: "Transaction Count",
      value: filtered.length.toLocaleString(),
    },
    {
      label: "Report Months",
      value: numMonths.toLocaleString(),
    },
  ];

  const exportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`financial-report-${startDate}-to-${endDate}.pdf`);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Reports
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Financial Reports
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Analyze cash flow, savings, income sources and spending patterns.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchAllTransactions}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={exportPDF}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>

          <button
            onClick={printReport}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <ReportsSkeleton />
      ) : (
        <div ref={reportRef} className="space-y-5">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Income"
              value={formatCurrency(totalIncome)}
              helper={`${incomes.length} income transaction${
                incomes.length === 1 ? "" : "s"
              }`}
              icon={TrendingUp}
              tone="green"
            />

            <KpiCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              helper={`${expenses.length} expense transaction${
                expenses.length === 1 ? "" : "s"
              }`}
              icon={TrendingDown}
              tone="red"
            />

            <KpiCard
              label="Net Savings"
              value={formatCurrency(netSavings)}
              helper={netSavings >= 0 ? "Positive cash flow" : "Negative cash flow"}
              icon={DollarSign}
              tone={netSavings >= 0 ? "green" : "red"}
            />

            <KpiCard
              label="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              helper={savingsRate >= 20 ? "Strong savings rate" : "Below 20% target"}
              icon={Percent}
              tone={savingsRate >= 20 ? "green" : savingsRate >= 0 ? "amber" : "red"}
            />
          </section>

          <Panel
            title="Income vs Expenses"
            subtitle="Monthly comparison for the selected reporting period"
          >
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={monthlyTrend}>
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
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar
                  dataKey="income"
                  fill="var(--chart-2)"
                  name="Income"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--chart-1)"
                  name="Expenses"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel
              title="Net Cash Flow"
              subtitle="Monthly net movement"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={285}>
                <LineChart data={cashFlow}>
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
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--chart-4)"
                    strokeWidth={2.6}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Net Cash Flow"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="var(--chart-3)"
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Cumulative"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Income Sources" subtitle="Income split by category">
              {incomeSources.length === 0 ? (
                <div className="flex h-[285px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-center">
                  <WalletCards className="mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No income data
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Income sources will appear here.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={285}>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeSources.map((_, index) => (
                        <Cell
                          key={`income-cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
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
            </Panel>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel
              title="Expense Breakdown"
              subtitle="Spending split by category"
              className="xl:col-span-1"
            >
              {categoryBreakdown.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <TrendingDown className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No expense data
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Category breakdown will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.slice(0, 6).map((cat) => {
                    const percentage =
                      totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;

                    return (
                      <div key={cat.name}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-card-foreground">
                              {cat.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(cat.value)}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-card-foreground">
                            {percentage.toFixed(0)}%
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel
              title="Key Financial Metrics"
              subtitle="Calculated from the selected report period"
              className="xl:col-span-2"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/70 bg-background/50 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="mt-2 truncate text-lg font-semibold text-card-foreground">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <Panel
            title="Cash Flow Statement"
            subtitle="Monthly income, expenses, net and cumulative balance"
            right={
              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
              </span>
            }
          >
            <div className="mb-4 rounded-xl border border-border/80 bg-background/50 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-card-foreground">
                    Report filters
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-input-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />

                  <span className="hidden text-xs text-muted-foreground sm:block">
                    to
                  </span>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-input-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {cashFlow.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                <FileText className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium text-card-foreground">
                  No cash flow data
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Adjust your report filters to include transactions.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border/80">
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Month
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Income
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Expenses
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Net
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Cumulative
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {cashFlow.map((row, i) => (
                        <tr
                          key={row.key}
                          className={cn(
                            "transition-colors hover:bg-accent/40",
                            i !== cashFlow.length - 1 &&
                              "border-b border-border/70",
                          )}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                            {row.month}
                          </td>

                          <td className="px-4 py-3 text-right text-sm text-emerald-500">
                            {formatCurrency(row.income)}
                          </td>

                          <td className="px-4 py-3 text-right text-sm text-card-foreground">
                            {formatCurrency(row.expenses)}
                          </td>

                          <td
                            className={cn(
                              "px-4 py-3 text-right text-sm font-semibold",
                              row.net >= 0 ? "text-emerald-500" : "text-red-500",
                            )}
                          >
                            {formatCurrency(row.net)}
                          </td>

                          <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                            {formatCurrency(row.cumulative)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>

          <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  AI-Generated Report Summary
                </h3>

                {aiLoading ? (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Generating summary...
                  </p>
                ) : (
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                    {aiSummary || "No AI summary available."}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}