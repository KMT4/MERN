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

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const [amountInputs, setAmountInputs] =
    useState<{
      [key: string]: string;
    }>({});

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
  const handleCreateGoal = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      await createGoal({
        title: formData.title,
        targetAmount: Number(
          formData.targetAmount
        ),
        currentAmount:
          Number(formData.currentAmount) || 0,
        deadline: formData.deadline || null,
      });

      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
      });

      setShowAddForm(false);

      fetchGoals();
    } catch (error) {
      console.error("Create goal error:", error);
    }
  };

  // ADD PROGRESS
  const handleAddProgress = async (
    goalId: string
  ) => {
    try {
      const amount = Number(
        amountInputs[goalId]
      );

      if (!amount || amount <= 0) return;

      await updateGoalProgress(goalId, amount);

      setAmountInputs((prev) => ({
        ...prev,
        [goalId]: "",
      }));

      fetchGoals();
    } catch (error) {
      console.error(
        "Update progress error:",
        error
      );
    }
  };

  // DELETE GOAL
  const handleDeleteGoal = async (
    goalId: string
  ) => {
    try {
      await deleteGoal(goalId);

      setGoals((prev) =>
        prev.filter(
          (goal) => goal._id !== goalId
        )
      );
    } catch (error) {
      console.error(
        "Delete goal error:",
        error
      );
    }
  };

  // SUMMARY STATS
  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum + goal.currentAmount,
    0
  );

  const totalTargets = goals.reduce(
    (sum, goal) =>
      sum + goal.targetAmount,
    0
  );

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">
          Loading goals...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold mb-1">
            Savings Goals
          </h2>

          <p className="text-muted-foreground">
            Track your financial progress
          </p>
        </div>

        <button
          onClick={() =>
            setShowAddForm(!showAddForm)
          }
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">
              Total Saved
            </span>

            <Target className="w-5 h-5 text-chart-2" />
          </div>

          <div className="text-3xl font-bold">
            ${totalSaved.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">
              Total Targets
            </span>

            <TrendingUp className="w-5 h-5 text-chart-4" />
          </div>

          <div className="text-3xl font-bold">
            ${totalTargets.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">
              Completed Goals
            </span>

            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <div className="text-3xl font-bold">
            {completedGoals}
          </div>
        </div>
      </div>

      {/* CREATE FORM */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-5">
            Create Savings Goal
          </h3>

          <form
            onSubmit={handleCreateGoal}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              required
              placeholder="Goal title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg outline-none"
            />

            <input
              type="number"
              required
              placeholder="Target amount"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetAmount:
                    e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg outline-none"
            />

            <input
              type="number"
              placeholder="Current amount"
              value={formData.currentAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentAmount:
                    e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg outline-none"
            />

            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline:
                    e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg outline-none"
            />

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
              >
                Create Goal
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddForm(false)
                  
                }
                className="bg-secondary px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMPTY STATE */}
      {goals.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

          <h3 className="text-xl font-semibold mb-2">
            No savings goals yet
          </h3>

          <p className="text-muted-foreground">
            Create your first goal to start tracking savings.
          </p>
        </div>
      )}

      {/* GOALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => (
          <div
            key={goal._id}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold">
                  {goal.title}
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Deadline:{" "}
                  {goal.deadline
                    ? new Date(
                        goal.deadline
                      ).toLocaleDateString()
                    : "No deadline"}
                </p>
              </div>

              {goal.completed && (
                <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Progress
                </span>

                <span className="font-semibold">
                  {goal.progressPercentage}%
                </span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    goal.completed
                      ? "bg-green-500"
                      : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(
                      goal.progressPercentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Saved
                </p>

                <p className="font-semibold">
                  $
                  {goal.currentAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Remaining
                </p>

                <p className="font-semibold">
                  $
                  {goal.remainingAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Target
                </p>

                <p className="font-semibold">
                  $
                  {goal.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {!goal.completed && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Add amount"
                    value={
                      amountInputs[
                        goal._id
                      ] || ""
                    }
                    onChange={(e) =>
                      setAmountInputs(
                        (prev) => ({
                          ...prev,
                          [goal._id]:
                            e.target.value,
                        })
                      )
                    }
                    className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg outline-none"
                  />

                  <button
                    onClick={() =>
                      handleAddProgress(
                        goal._id
                      )
                    }
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )}

              <button
                onClick={() =>
                  handleDeleteGoal(
                    goal._id
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
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