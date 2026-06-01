import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Briefcase,
  DollarSign,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  Repeat2,
  CalendarDays,
  WalletCards,
} from "lucide-react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  Transaction,
} from "../../api/transactions";
import { getMonthlySummary } from "../../api/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const INCOME_CATEGORIES = [
  "Employment",
  "Freelance",
  "Investments",
  "Real Estate",
  "Business",
  "Other",
];

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
  tone = "green",
}: {
  label: string;
  value: string;
  helper: string;
  icon: any;
  tone?: "green" | "blue" | "amber" | "neutral";
}) {
  const toneClass = {
    green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
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

function IncomeSkeleton() {
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

      <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}

export function Income() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(0);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Employment",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    isRecurring: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [txns, summary] = await Promise.all([
        getTransactions("income"),
        getMonthlySummary(),
      ]);

      setIncomes(txns);

      const incomeItem = summary.find((s) => s._id === "income");
      setMonthlyIncomeTotal(incomeItem ? incomeItem.total : 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load income data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError("");

    try {
      await createTransaction({
        type: "income",
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
        category: "Employment",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "",
        isRecurring: false,
      });

      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this income entry?")) return;

    try {
      await deleteTransaction(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const incomeCount = incomes.length;

  const ytdIncome = incomes
    .filter((t) => new Date(t.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);

  const recurringCount = incomes.filter((income) => income.isRecurring).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Income
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Income Tracking
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor salary, freelance payments, business revenue and recurring
            income.
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
            Add Income
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading && incomes.length === 0 ? (
        <IncomeSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard
              label="This Month"
              value={formatCurrency(monthlyIncomeTotal)}
              helper="Total income received"
              icon={DollarSign}
              tone="green"
            />

            <KpiCard
              label="Entries"
              value={incomeCount.toLocaleString()}
              helper={`${recurringCount} recurring source${
                recurringCount === 1 ? "" : "s"
              }`}
              icon={WalletCards}
              tone="blue"
            />

            <KpiCard
              label="YTD Income"
              value={formatCurrency(ytdIncome)}
              helper="Current year total"
              icon={Briefcase}
              tone="amber"
            />
          </section>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleAddIncome}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-card-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="e.g., Salary, Freelance"
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
                    {INCOME_CATEGORIES.map((cat) => (
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
                    placeholder="e.g., Bank Transfer"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="income-recurring"
                    className="w-4 h-4 rounded border-border"
                    checked={form.isRecurring}
                    onChange={(e) =>
                      setForm({ ...form, isRecurring: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="income-recurring"
                    className="text-card-foreground"
                  >
                    Recurring income
                  </label>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Income"}
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

          <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Income Entries
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All recorded income sources and payments.
                </p>
              </div>

              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {incomeCount} record{incomeCount === 1 ? "" : "s"}
              </span>
            </div>

            {!loading && incomes.length === 0 ? (
              <div className="p-4">
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <TrendingUp className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No income recorded yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first income source to start tracking revenue.
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
                          Source
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
                      {incomes.map((income, index) => (
                        <tr
                          key={income._id}
                          className={cn(
                            "transition-colors hover:bg-accent/40",
                            index !== incomes.length - 1 &&
                              "border-b border-border/70",
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-card-foreground">
                                  {income.description}
                                </p>

                                {income.isRecurring && (
                                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                                    <Repeat2 className="h-3 w-3" />
                                    Recurring
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {income.category}
                          </td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(income.date).toLocaleDateString()}
                          </td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {income.paymentMethod || "—"}
                          </td>

                          <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-500">
                            +{formatCurrency(income.amount)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(income._id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {incomes.map((income) => (
                    <div
                      key={income._id}
                      className="rounded-xl border border-border/80 bg-background/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-card-foreground">
                              {income.description}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {income.category}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(income._id)}
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
                            {new Date(income.date).toLocaleDateString()}
                          </div>

                          {income.isRecurring && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                              <Repeat2 className="h-3.5 w-3.5" />
                              Recurring
                            </div>
                          )}
                        </div>

                        <p className="text-base font-semibold text-emerald-500">
                          +{formatCurrency(income.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}