import { useState, useEffect } from "react";
import {
  Plus,
  TrendingDown,
  Coffee,
  Home,
  Car,
  Zap,
  ShoppingCart,
  Trash2,
  RefreshCw,
  CalendarDays,
  Repeat2,
  ArrowDownRight,
  WalletCards,
  ReceiptText,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  Transaction,
} from "../../api/transactions";
import {
  getMonthlySummary,
  getCategoryBreakdown,
  CategoryBreakdownItem,
} from "../../api/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Other",
];

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Housing: Home,
  Transportation: Car,
  Utilities: Zap,
  Shopping: ShoppingCart,
  Entertainment: ShoppingCart,
  Healthcare: Zap,
};

const categoryColors: Record<string, string> = {
  Food: "var(--chart-2)",
  Housing: "var(--chart-1)",
  Transportation: "var(--chart-3)",
  Utilities: "var(--chart-4)",
  Entertainment: "var(--chart-5)",
  Healthcare: "#9CA3AF",
  Shopping: "#F59E0B",
  Other: "#6B7280",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "red",
}: {
  label: string;
  value: string;
  helper: string;
  icon: any;
  tone?: "red" | "blue" | "amber" | "neutral";
}) {
  const toneClass = {
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
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <div className="border-b border-border/80 p-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function ExpensesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card xl:col-span-3" />
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}

export function Expenses() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdownItem[]
  >([]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    isRecurring: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [txns, summary, breakdown] = await Promise.all([
        getTransactions("expense"),
        getMonthlySummary(),
        getCategoryBreakdown(),
      ]);

      setExpenses(txns);

      const expenseItem = summary.find((s) => s._id === "expense");
      setMonthlyExpenseTotal(expenseItem ? expenseItem.total : 0);

      setCategoryBreakdown(breakdown);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load expense data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError("");

    try {
      await createTransaction({
        type: "expense",
        amount,
        category: form.category,
        description: form.description || form.category,
        date: form.date,
        paymentMethod: form.paymentMethod,
        isRecurring: form.isRecurring,
      });

      setForm({
        description: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "",
        isRecurring: false,
      });

      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;

    try {
      await deleteTransaction(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  const avgDailySpending = monthlyExpenseTotal / daysInMonth;

  const recurringTotal = expenses
    .filter((t) => t.isRecurring)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyChartData = getMonthlySpending(expenses);
  const expenseCount = expenses.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Expenses
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Expense Tracking
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track spending, spot patterns and manage recurring costs.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading && expenses.length === 0 ? (
        <ExpensesSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard
              label="This Month"
              value={formatCurrency(monthlyExpenseTotal)}
              helper={`${expenseCount} expense record${
                expenseCount === 1 ? "" : "s"
              }`}
              icon={ArrowDownRight}
              tone="red"
            />

            <KpiCard
              label="Daily Average"
              value={formatCurrency(Number(avgDailySpending.toFixed(0)))}
              helper="Based on current month"
              icon={Activity}
              tone="blue"
            />

            <KpiCard
              label="Recurring"
              value={`${formatCurrency(recurringTotal)}/mo`}
              helper="Auto-repeating expenses"
              icon={Repeat2}
              tone="amber"
            />
          </section>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleAddExpense}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-card-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="e.g., Grocery Shopping"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-card-foreground mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-card-foreground mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-card-foreground mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-card-foreground mb-2">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="e.g., Credit Card"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="expense-recurring"
                    className="w-4 h-4 rounded border-border"
                    checked={form.isRecurring}
                    onChange={(e) =>
                      setForm({ ...form, isRecurring: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="expense-recurring"
                    className="text-card-foreground"
                  >
                    Recurring expense
                  </label>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Expense"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <Panel
              title="Spending by Category"
              subtitle="Category share of this month's expenses"
              className="xl:col-span-2"
            >
              {categoryBreakdown.length === 0 && !loading ? (
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <WalletCards className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No expenses recorded yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your category breakdown will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => {
                    const Icon = categoryIcons[cat._id] || ShoppingCart;
                    const color = categoryColors[cat._id] || "#6B7280";
                    const percentage =
                      monthlyExpenseTotal > 0
                        ? (cat.total / monthlyExpenseTotal) * 100
                        : 0;

                    return (
                      <div key={cat._id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${color}18` }}
                            >
                              <Icon
                                className="h-4 w-4"
                                style={{ color }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-card-foreground">
                                {cat._id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(cat.total)} spent
                              </p>
                            </div>
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
                              backgroundColor: color,
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
              title="Monthly Spending Trend"
              subtitle="Expense movement across the last 6 months"
              className="xl:col-span-3"
            >
              <ResponsiveContainer width="100%" height={285}>
                <BarChart data={monthlyChartData}>
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
                  <Bar
                    dataKey="amount"
                    fill="var(--chart-1)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </section>

          <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Recent Expenses
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Latest spending records and payment activity.
                </p>
              </div>

              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                Showing {Math.min(expenses.length, 20)} of {expenses.length}
              </span>
            </div>

            {!loading && expenses.length === 0 ? (
              <div className="p-4">
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <ReceiptText className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No expenses found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first expense to start tracking spending.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border/80">
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Expense
                        </th>
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Category
                        </th>
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Date
                        </th>
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Method
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses.slice(0, 20).map((expense, index) => {
                        const Icon = categoryIcons[expense.category] || ShoppingCart;
                        const color = categoryColors[expense.category] || "#6B7280";

                        return (
                          <tr
                            key={expense._id}
                            className={cn(
                              "transition-colors hover:bg-accent/40",
                              index !== Math.min(expenses.length, 20) - 1 &&
                                "border-b border-border/70",
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${color}18` }}
                                >
                                  <Icon
                                    className="h-4 w-4"
                                    style={{ color }}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-card-foreground">
                                    {expense.description}
                                  </p>

                                  {expense.isRecurring && (
                                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                                      <Repeat2 className="h-3 w-3" />
                                      Recurring
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {expense.category}
                            </td>

                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {expense.paymentMethod || "—"}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">
                              -{formatCurrency(expense.amount)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDelete(expense._id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {expenses.slice(0, 20).map((expense) => {
                    const Icon = categoryIcons[expense.category] || ShoppingCart;
                    const color = categoryColors[expense.category] || "#6B7280";

                    return (
                      <div
                        key={expense._id}
                        className="rounded-xl border border-border/80 bg-background/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${color}18` }}
                            >
                              <Icon className="h-4 w-4" style={{ color }} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-card-foreground">
                                {expense.description}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {expense.category}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>

                            {expense.isRecurring && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                <Repeat2 className="h-3.5 w-3.5" />
                                Recurring
                              </div>
                            )}
                          </div>

                          <p className="text-base font-semibold text-card-foreground">
                            -{formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function getMonthlySpending(expenses: Transaction[]) {
  const months: { month: string; amount: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString("default", { month: "short" });

    const total = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    months.push({ month: monthName, amount: total });
  }

  return months;
}