import { useState } from 'react';
import { Plus, Target, TrendingUp } from 'lucide-react';

export function Savings() {
  const [showAddForm, setShowAddForm] = useState(false);

  const savingsGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      target: 10000,
      current: 6500,
      deadline: 'Sep 2026',
      monthlyContribution: 500,
      color: 'var(--chart-1)'
    },
    {
      id: 2,
      name: 'Vacation to Japan',
      target: 5000,
      current: 2800,
      deadline: 'Dec 2026',
      monthlyContribution: 300,
      color: 'var(--chart-2)'
    },
    {
      id: 3,
      name: 'New Laptop',
      target: 2000,
      current: 1600,
      deadline: 'Jun 2026',
      monthlyContribution: 200,
      color: 'var(--chart-3)'
    },
    {
      id: 4,
      name: 'House Down Payment',
      target: 50000,
      current: 12000,
      deadline: 'Dec 2027',
      monthlyContribution: 1000,
      color: 'var(--chart-4)'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Savings Goals</h2>
          <p className="text-muted-foreground">Track your financial goals and progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Saved</span>
            <Target className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$22,900</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Goals</span>
            <TrendingUp className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$67,000</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Monthly Savings</span>
            <Target className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$2,000</div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Create Savings Goal</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Goal Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Target Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Current Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Target Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Monthly Contribution</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const monthsToGoal = Math.ceil(remaining / goal.monthlyContribution);

          return (
            <div key={goal.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-card-foreground">{goal.name}</h4>
                  <p className="text-sm text-muted-foreground">Target: {goal.deadline}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${goal.color}20` }}>
                  <Target className="w-6 h-6" style={{ color: goal.color }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-card-foreground">{percentage.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: goal.color
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Saved</p>
                    <p className="font-semibold text-card-foreground">${goal.current.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-semibold text-card-foreground">${goal.target.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold text-card-foreground">${remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Monthly contribution</span>
                    <span className="font-semibold" style={{ color: goal.color }}>${goal.monthlyContribution}</span>
                  </div>
                  {monthsToGoal > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Estimated completion: {monthsToGoal} month{monthsToGoal !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
