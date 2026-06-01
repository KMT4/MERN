import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  Trash2,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  getGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
} from "../../api/goal";
import {getCurrencySymbol} from "../../utils/currency"

interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  completed: boolean;
  deadline?: string;
  createdAt: string;
}

export function Savings() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>({});

  // FETCH GOALS
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data.goals);
    } catch (error) {
      console.error("Fetch goals error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // CREATE GOAL
  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createGoal({
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount) || 0,
        deadline: formData.deadline || null,
      });
      setFormData({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error("Create goal error:", error);
    }
  };

  // ADD PROGRESS
  const handleAddProgress = async (goalId: string) => {
    try {
      const amount = Number(amountInputs[goalId]);
      if (!amount || amount <= 0) return;
      await updateGoalProgress(goalId, amount);
      setAmountInputs((prev) => ({ ...prev, [goalId]: "" }));
      fetchGoals();
    } catch (error) {
      console.error("Update progress error:", error);
    }
  };

  // DELETE GOAL
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Delete goal error:", error);
    }
  };

  // SUMMARY STATS
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const completedGoals = goals.filter((goal) => goal.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Savings Goals
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Track your financial progress
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Saved</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{totalSaved.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Targets</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{totalTargets.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Completed Goals</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {completedGoals}
          </div>
        </div>
      </div>

      {/* CREATE FORM */}
      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-5">Create Savings Goal</h3>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Goal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="number"
              required
              placeholder="Target amount"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="number"
              placeholder="Current amount"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Create Goal
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

      {/* EMPTY STATE */}
      {goals.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No savings goals yet</h3>
          <p className="text-sm text-gray-500">
            Create your first goal to start tracking savings.
          </p>
        </div>
      )}

      {/* GOALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => (
          <div
            key={goal._id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-foreground">{goal.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Deadline:{" "}
                  {goal.deadline
                    ? new Date(goal.deadline).toLocaleDateString()
                    : "No deadline"}
                </p>
              </div>
              {goal.completed && (
                <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Completed
                </span>
              )}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-sm font-semibold">
                  {goal.progressPercentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    goal.completed ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-xs text-gray-500">Saved</p>
                <p className="text-sm font-semibold">
                {getCurrencySymbol()}{goal.currentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-semibold">
                {getCurrencySymbol()}{goal.remainingAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-sm font-semibold">
                {getCurrencySymbol()}{goal.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {!goal.completed && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Add amount"
                    value={amountInputs[goal._id] || ""}
                    onChange={(e) =>
                      setAmountInputs((prev) => ({
                        ...prev,
                        [goal._id]: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => handleAddProgress(goal._id)}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
              )}

              <button
                onClick={() => handleDeleteGoal(goal._id)}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Goal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}