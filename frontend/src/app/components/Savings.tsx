import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  Trash2,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  WalletCards,
  CalendarDays,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";

import {
  getGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
} from "../../api/goal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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

function SavingsSkeleton() {
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
            className="h-64 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
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

  const [amountInputs, setAmountInputs] = useState<{
    [key: string]: string;
  }>({});

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

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createGoal({
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount) || 0,
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

  const handleAddProgress = async (goalId: string) => {
    try {
      const amount = Number(amountInputs[goalId]);
      if (!amount || amount <= 0) return;

      await updateGoalProgress(goalId, amount);

      setAmountInputs((prev) => ({
        ...prev,
        [goalId]: "",
      }));

      fetchGoals();
    } catch (error) {
      console.error("Update progress error:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Delete this savings goal?")) return;

    try {
      await deleteGoal(goalId);

      setGoals((prev) => prev.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Delete goal error:", error);
    }
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  const completedGoals = goals.filter((goal) => goal.completed).length;

  const overallProgress =
    totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Savings
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Savings Goals
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track financial goals, savings progress and remaining targets.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchGoals}
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
            Add Goal
          </button>
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <SavingsSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard
              label="Total Saved"
              value={formatCurrency(totalSaved)}
              helper={`${overallProgress.toFixed(0)}% of all targets`}
              icon={WalletCards}
              tone="green"
            />

            <KpiCard
              label="Total Targets"
              value={formatCurrency(totalTargets)}
              helper={`${goals.length} active goal${goals.length === 1 ? "" : "s"}`}
              icon={Target}
              tone="blue"
            />

            <KpiCard
              label="Completed"
              value={completedGoals.toLocaleString()}
              helper="Goals fully funded"
              icon={CheckCircle}
              tone="green"
            />
          </section>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleCreateGoal}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm text-card-foreground">
                    Goal title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Emergency fund"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-card-foreground">
                    Target amount
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-card-foreground">
                    Current amount
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={formData.currentAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-card-foreground">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    Create Goal
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full rounded-lg bg-secondary px-6 py-3 text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
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
                  Goal Progress
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Monitor active savings goals and update progress.
                </p>
              </div>

              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {goals.length} goal{goals.length === 1 ? "" : "s"}
              </span>
            </div>

            {goals.length === 0 ? (
              <div className="p-4">
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <Target className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />

                  <p className="text-sm font-medium text-card-foreground">
                    No savings goals yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Create your first goal to start tracking savings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {goals.map((goal) => {
                  const progress = Math.min(goal.progressPercentage, 100);
                  const isComplete = goal.completed || progress >= 100;

                  return (
                    <article
                      key={goal._id}
                      className={cn(
                        "rounded-2xl border bg-background/40 p-4 transition-all hover:shadow-md",
                        isComplete
                          ? "border-emerald-500/35"
                          : "border-border/80 hover:border-primary/25",
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-card-foreground">
                              {goal.title}
                            </h3>

                            {isComplete && (
                              <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500 ring-1 ring-emerald-500/15">
                                Completed
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {goal.deadline
                              ? new Date(goal.deadline).toLocaleDateString()
                              : "No deadline"}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>

                            <span
                              className={cn(
                                "font-semibold",
                                isComplete ? "text-emerald-500" : "text-primary",
                              )}
                            >
                              {progress.toFixed(0)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                isComplete ? "bg-emerald-500" : "bg-primary",
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Saved
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
                              {formatCurrency(goal.currentAmount)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Left
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
                              {formatCurrency(goal.remainingAmount)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Target
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>

                        {!isComplete && (
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
                              className="h-9 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <button
                              onClick={() => handleAddProgress(goal._id)}
                              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              Add
                            </button>
                          </div>
                        )}

                        {isComplete && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
                              <CheckCircle className="h-4 w-4" />
                              Goal completed successfully.
                            </div>
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