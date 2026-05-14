import { useState } from 'react';
import { Plus, Target, AlertCircle, CheckCircle } from 'lucide-react';

export function Budgets() {
  const [showAddForm, setShowAddForm] = useState(false);

  const budgets = [
    { id: 1, category: 'Food', limit: 550, spent: 600, period: 'Monthly', alert: true },
    { id: 2, category: 'Housing', limit: 1300, spent: 1200, period: 'Monthly', alert: false },
    { id: 3, category: 'Transportation', limit: 450, spent: 400, period: 'Monthly', alert: false },
    { id: 4, category: 'Entertainment', limit: 250, spent: 300, period: 'Monthly', alert: true },
    { id: 5, category: 'Utilities', limit: 300, spent: 250, period: 'Monthly', alert: false },
    { id: 6, category: 'Shopping', limit: 200, spent: 150, period: 'Monthly', alert: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Budget Management</h2>
          <p className="text-muted-foreground">Set spending limits and track progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Budget</span>
            <Target className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$3,050</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Spent</span>
            <Target className="w-5 h-5 text-chart-1" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$2,900</div>
          <p className="text-sm text-muted-foreground mt-1">95% of budget</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Budget Alerts</span>
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">2</div>
          <p className="text-sm text-destructive mt-1">Budgets exceeded</p>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Create New Budget</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Category</label>
              <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
                <option>Food</option>
                <option>Housing</option>
                <option>Transportation</option>
                <option>Utilities</option>
                <option>Entertainment</option>
                <option>Healthcare</option>
                <option>Shopping</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Budget Limit</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Period</label>
              <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Alert Threshold (%)</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="80"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Budget
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
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = budget.spent > budget.limit;
          const remaining = budget.limit - budget.spent;

          return (
            <div key={budget.id} className={`bg-card border rounded-lg p-6 ${isOverBudget ? 'border-destructive' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-card-foreground">{budget.category}</h4>
                  <p className="text-sm text-muted-foreground">{budget.period}</p>
                </div>
                {isOverBudget ? (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-chart-2" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-card-foreground'}`}>
                    ${budget.spent} / ${budget.limit}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isOverBudget ? 'var(--destructive)' : percentage > 80 ? 'var(--chart-4)' : 'var(--chart-2)'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">
                    {isOverBudget ? 'Over budget' : 'Remaining'}
                  </span>
                  <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-chart-2'}`}>
                    {isOverBudget ? '+' : ''}${Math.abs(remaining)}
                  </span>
                </div>

                {percentage >= 80 && (
                  <div className={`mt-3 p-3 rounded-lg ${isOverBudget ? 'bg-destructive/10' : 'bg-chart-4/10'}`}>
                    <p className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-chart-4'}`}>
                      {isOverBudget
                        ? `You've exceeded your budget by $${Math.abs(remaining)}`
                        : `You've used ${percentage.toFixed(0)}% of your budget`
                      }
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
