import { useState, useEffect } from "react";
import {
  Plus,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Pencil,
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

export function Budgets() {
  // Data
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Summary
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  // Create form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "Food",
    limit: "",
    month: new Date().toISOString().slice(0, 7),
    alertThreshold: "80",
  });

  // Edit state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: "Food",
    limit: "",
    month: "",
    alertThreshold: "80",
  });

  // Fetch data
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

  // Create budget handler
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

  // Start editing a budget
  const startEdit = (budget: BudgetStatus) => {
    setEditingBudgetId(budget._id!);
    setEditForm({
      category: budget.category,
      limit: budget.limit.toString(),
      month: new Date().toISOString().slice(0, 7),
      alertThreshold: (budget.alertThreshold * 100).toString(),
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingBudgetId(null);
  };

  // Save edit
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

  // Delete budget
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground mb-1">Budget Management</h2>
          <p className="text-muted-foreground">
            Set spending limits and track progress
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Budget
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Budget</span>
            <Target className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            ${totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Spent</span>
            <Target className="w-5 h-5 text-chart-1" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            ${totalSpent.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {totalBudget > 0
              ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% of budget`
              : "N/A"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Alerts</span>
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            {alertCount}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {alertCount > 0 ? "Budgets near or exceeded" : "All budgets on track"}
          </p>
        </div>
      </div>

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
              <label className="block text-card-foreground mb-2">Category</label>
              <select
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, category: e.target.value })
                }
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Budget Limit ($)</label>
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
              <label className="block text-card-foreground mb-2">Month</label>
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
                  setNewBudget({ ...newBudget, alertThreshold: e.target.value })
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
          <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-card-foreground mb-2">Category</label>
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
              <label className="block text-card-foreground mb-2">Budget Limit ($)</label>
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

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const percentage =
            budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
          const isOverBudget = budget.exceeded;
          const isNearLimit = budget.nearLimit;
          const statusColor = isOverBudget
            ? "var(--destructive)"
            : isNearLimit
            ? "var(--chart-4)"
            : "var(--chart-2)";
          const borderColor = isOverBudget
            ? "border-destructive"
            : isNearLimit
            ? "border-chart-4"
            : "border-border";

          return (
            <div
              key={budget._id}
              className={`bg-card border ${borderColor} rounded-lg p-6`}
            >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-card-foreground font-medium">
                        {budget.category}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {budget.alertThreshold * 100}% alert threshold
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(budget)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Edit budget"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id!)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete budget"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {isOverBudget ? (
                        <AlertCircle className="w-6 h-6 text-destructive" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-chart-2" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar and info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span
                        className={`font-semibold ${
                          isOverBudget ? "text-destructive" : "text-card-foreground"
                        }`}
                      >
                        ${budget.spent.toLocaleString()} / $
                        {budget.limit.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: statusColor,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2">
                      <span className="text-muted-foreground">
                        {isOverBudget ? "Over budget" : "Remaining"}
                      </span>
                      <span
                        className={`font-semibold ${
                          isOverBudget ? "text-destructive" : "text-chart-2"
                        }`}
                      >
                        {isOverBudget ? "+" : ""}$
                        {Math.abs(budget.remaining).toLocaleString()}
                      </span>
                    </div>

                    {isOverBudget && (
                      <div className="mt-3 p-3 rounded-lg bg-destructive/10">
                        <p className="text-sm text-destructive">
                          You have exceeded this budget by $
                          {Math.abs(budget.remaining).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {!isOverBudget && isNearLimit && (
                      <div className="mt-3 p-3 rounded-lg bg-chart-4/10">
                        <p className="text-sm text-chart-4">
                          Approaching limit — you have used{" "}
                          {percentage.toFixed(0)}% of your budget.
                        </p>
                      </div>
                    )}
                  </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
