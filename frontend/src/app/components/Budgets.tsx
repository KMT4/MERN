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
import { getCurrencySymbol } from "../../utils/currency"

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
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Budget Management
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Set spending limits and track progress
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Budget
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {getCurrencySymbol()}{totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
            <Target className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {totalBudget > 0
              ? `${getCurrencySymbol()}${((totalSpent / totalBudget) * 100).toFixed(0)}% of budget`
              : "N/A"}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Alerts</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {alertCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {alertCount > 0 ? "Budgets near or exceeded" : "All budgets on track"}
          </p>
        </div>
      </div>

      {/* Create Budget Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-5">Create New Budget</h3>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Budget Limit ($)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Month</label>
              <input
                type="month"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newBudget.month}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, month: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alert Threshold (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Create Budget"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards Grid */}
      {!loading && budgets.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-gray-400 mb-4">
            <Target className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No budgets yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first budget to start tracking your spending.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              ? "border-red-200"
              : isNearLimit
              ? "border-amber-200"
              : "border-gray-100";

            const isEditing = editingBudgetId === budget._id;

            return (
              <div
                key={budget._id}
                className={`bg-white border ${borderColor} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <h4 className="text-base font-medium text-foreground">
                      Edit Budget
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        <label className="block text-sm font-medium text-foreground mb-1">Limit ($)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={editForm.limit}
                          onChange={(e) =>
                            setEditForm({ ...editForm, limit: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Alert Threshold (%)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={editForm.alertThreshold}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              alertThreshold: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-base font-medium text-foreground">
                          {budget.category}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {budget.alertThreshold * 100}% alert threshold
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(budget)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="Edit budget"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget._id!)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isOverBudget ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Progress bar and info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Spent</span>
                        <span
                          className={`font-semibold ${
                            isOverBudget ? "text-red-600" : "text-foreground"
                          }`}
                        >
                          {getCurrencySymbol()}{budget.spent.toLocaleString()} / {getCurrencySymbol()}
                          {budget.limit.toLocaleString()}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: statusColor,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-gray-500">
                          {isOverBudget ? "Over budget" : "Remaining"}
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverBudget ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {isOverBudget ? "+" : ""}{getCurrencySymbol()}
                          {Math.abs(budget.remaining).toLocaleString()}
                        </span>
                      </div>

                      {isOverBudget && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                          <p className="text-sm text-red-600 font-medium">
                            You have exceeded this budget by   
                            {getCurrencySymbol()} {Math.abs(budget.remaining).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {!isOverBudget && isNearLimit && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-sm text-amber-600 font-medium">
                            Approaching limit — you have used{" "}
                            {percentage.toFixed(0)}% of your budget.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}