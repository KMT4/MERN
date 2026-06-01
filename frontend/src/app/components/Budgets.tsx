import { useState, useEffect } from "react";
import {
  Plus,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Pencil,
  WalletCards,
  Activity,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import {
  getBudgetStatus,
  getBudgetAlerts,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../../api/budgets";
import type { BudgetStatus } from "../../api/budgets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
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

function BudgetSkeleton() {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

export function Budgets() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "Food",
    limit: "",
    month: new Date().toISOString().slice(0, 7),
    alertThreshold: "80",
  });

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: "Food",
    limit: "",
    month: "",
    alertThreshold: "80",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [statusRes, alertsRes] = await Promise.all([
        getBudgetStatus(),
        getBudgetAlerts(),
      ]);

      setBudgets(statusRes);
      setTotalBudget(statusRes.reduce((sum, b) => sum + b.limit, 0));
      setTotalSpent(statusRes.reduce((sum, b) => sum + b.spent, 0));
      setAlertCount(alertsRes.count);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const limit = parseFloat(newBudget.limit);
    if (!limit || limit <= 0) return;

    setLoading(true);

    try {
      await createBudget({
        category: newBudget.category,
        limit,
        month: newBudget.month,
        alertThreshold: parseFloat(newBudget.alertThreshold) / 100 || 0.8,
      });

      setNewBudget({
        category: "Food",
        limit: "",
        month: new Date().toISOString().slice(0, 7),
        alertThreshold: "80",
      });

      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (budget: BudgetStatus) => {
    setEditingBudgetId(budget._id!);
    setEditForm({
      category: budget.category,
      limit: budget.limit.toString(),
      month: new Date().toISOString().slice(0, 7),
      alertThreshold: (budget.alertThreshold * 100).toString(),
    });
  };

  const cancelEdit = () => {
    setEditingBudgetId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBudgetId) return;

    const limit = parseFloat(editForm.limit);
    if (!limit || limit <= 0) return;

    setLoading(true);

    try {
      await updateBudget(editingBudgetId, {
        category: editForm.category,
        limit,
        alertThreshold: parseFloat(editForm.alertThreshold) / 100 || 0.8,
      });

      setEditingBudgetId(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget? This action cannot be undone.")) return;

    setLoading(true);

    try {
      await deleteBudget(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete budget");
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Budgets
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Budget Management
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Set category limits, monitor usage and catch overspending early.
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
            Create Budget
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading && budgets.length === 0 ? (
        <BudgetSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard
              label="Total Budget"
              value={formatCurrency(totalBudget)}
              helper={`${budgets.length} active budget${
                budgets.length === 1 ? "" : "s"
              }`}
              icon={WalletCards}
              tone="blue"
            />

            <KpiCard
              label="Total Spent"
              value={formatCurrency(totalSpent)}
              helper={
                totalBudget > 0
                  ? `${usagePercentage.toFixed(0)}% of total budget`
                  : "No budget set"
              }
              icon={Gauge}
              tone={
                usagePercentage >= 100
                  ? "red"
                  : usagePercentage >= 80
                    ? "amber"
                    : "green"
              }
            />

            <KpiCard
              label="Alerts"
              value={alertCount.toLocaleString()}
              helper={
                alertCount > 0
                  ? "Budgets need attention"
                  : `Remaining ${formatCurrency(Math.max(remainingBudget, 0))}`
              }
              icon={ShieldAlert}
              tone={alertCount > 0 ? "red" : "green"}
            />
          </section>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleCreate}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-card-foreground mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={newBudget.category}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        category: e.target.value,
                      })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">
                    Budget Limit ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="0.00"
                    value={newBudget.limit}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, limit: e.target.value })
                    }
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">
                    Month
                  </label>
                  <input
                    type="month"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={newBudget.month}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, month: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    placeholder="80"
                    value={newBudget.alertThreshold}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        alertThreshold: e.target.value,
                      })
                    }
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Alert when spending reaches this % of limit
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? "Saving..." : "Create Budget"}
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

          <Dialog
            open={editingBudgetId !== null}
            onOpenChange={(open) => {
              if (!open) cancelEdit();
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-card-foreground mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">
                    Budget Limit ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={editForm.limit}
                    onChange={(e) =>
                      setEditForm({ ...editForm, limit: e.target.value })
                    }
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                    value={editForm.alertThreshold}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        alertThreshold: e.target.value,
                      })
                    }
                    min="1"
                    max="100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Budget"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEdit}
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
                  Budget Categories
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Track spending limits and category-level progress.
                </p>
              </div>

              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {budgets.length} budget{budgets.length === 1 ? "" : "s"}
              </span>
            </div>

            {budgets.length === 0 ? (
              <div className="p-4">
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <Target className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No budgets created yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Create your first budget to start tracking spending limits.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {budgets.map((budget) => {
                  const percentage =
                    budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

                  const isOverBudget = budget.exceeded;
                  const isNearLimit = budget.nearLimit;

                  const status = isOverBudget
                    ? "Exceeded"
                    : isNearLimit
                      ? "Near limit"
                      : "On track";

                  const statusStyle = isOverBudget
                    ? "bg-red-500/10 text-red-500 ring-red-500/15"
                    : isNearLimit
                      ? "bg-amber-500/10 text-amber-500 ring-amber-500/15"
                      : "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15";

                  const progressColor = isOverBudget
                    ? "var(--destructive)"
                    : isNearLimit
                      ? "var(--chart-4)"
                      : "var(--chart-2)";

                  return (
                    <article
                      key={budget._id}
                      className={cn(
                        "rounded-2xl border bg-background/40 p-4 transition-all hover:shadow-md",
                        isOverBudget
                          ? "border-red-500/35"
                          : isNearLimit
                            ? "border-amber-500/35"
                            : "border-border/80 hover:border-primary/25",
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-semibold text-card-foreground">
                              {budget.category}
                            </h4>

                            <span
                              className={cn(
                                "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                                statusStyle,
                              )}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {(budget.alertThreshold * 100).toFixed(0)}% alert
                            threshold
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => startEdit(budget)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            title="Edit budget"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(budget._id!)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                            title="Delete budget"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Spent
                            </p>

                            <p
                              className={cn(
                                "mt-1 text-lg font-semibold tracking-tight",
                                isOverBudget
                                  ? "text-red-500"
                                  : "text-card-foreground",
                              )}
                            >
                              {formatCurrency(budget.spent)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Limit
                            </p>

                            <p className="mt-1 text-sm font-medium text-card-foreground">
                              {formatCurrency(budget.limit)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>

                            <span
                              className={cn(
                                "font-semibold",
                                isOverBudget
                                  ? "text-red-500"
                                  : isNearLimit
                                    ? "text-amber-500"
                                    : "text-emerald-500",
                              )}
                            >
                              {percentage.toFixed(0)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: progressColor,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2">
                          <div className="flex items-center gap-2">
                            {isOverBudget ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            )}

                            <span className="text-xs font-medium text-muted-foreground">
                              {isOverBudget ? "Over budget" : "Remaining"}
                            </span>
                          </div>

                          <span
                            className={cn(
                              "text-sm font-semibold",
                              isOverBudget ? "text-red-500" : "text-emerald-500",
                            )}
                          >
                            {isOverBudget ? "+" : ""}
                            {formatCurrency(Math.abs(budget.remaining))}
                          </span>
                        </div>

                        {isOverBudget && (
                          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
                            <p className="text-xs leading-5 text-red-500">
                              You exceeded this budget by{" "}
                              {formatCurrency(Math.abs(budget.remaining))}.
                            </p>
                          </div>
                        )}

                        {!isOverBudget && isNearLimit && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                            <p className="text-xs leading-5 text-amber-500">
                              Approaching limit — you have used{" "}
                              {percentage.toFixed(0)}% of this budget.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}