import { useState } from 'react';
import { Plus, TrendingDown, ShoppingCart, Coffee, Home, Car, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Housing: Home,
  Transportation: Car,
  Utilities: Zap,
  Shopping: ShoppingCart,
};

const monthlyExpenses = [
  { month: 'Jan', amount: 3800 },
  { month: 'Feb', amount: 4100 },
  { month: 'Mar', amount: 3900 },
  { month: 'Apr', amount: 4300 },
  { month: 'May', amount: 4200 },
];

export function Expenses() {
  const [showAddForm, setShowAddForm] = useState(false);

  const expenses = [
    { id: 1, name: 'Rent', amount: 1200, category: 'Housing', date: 'May 1, 2026', recurring: true },
    { id: 2, name: 'Grocery Shopping', amount: 156, category: 'Food', date: 'May 3, 2026', recurring: false },
    { id: 3, name: 'Electric Bill', amount: 85, category: 'Utilities', date: 'May 7, 2026', recurring: true },
    { id: 4, name: 'Gas', amount: 65, category: 'Transportation', date: 'May 8, 2026', recurring: false },
    { id: 5, name: 'Internet', amount: 60, category: 'Utilities', date: 'May 5, 2026', recurring: true },
    { id: 6, name: 'Netflix Subscription', amount: 15, category: 'Entertainment', recurring: true, date: 'May 10, 2026' },
  ];

  const categoryTotals = [
    { category: 'Housing', amount: 1200, budget: 1300, icon: Home, color: 'var(--chart-1)' },
    { category: 'Food', amount: 600, budget: 550, icon: Coffee, color: 'var(--chart-2)' },
    { category: 'Transportation', amount: 400, budget: 450, icon: Car, color: 'var(--chart-3)' },
    { category: 'Utilities', amount: 250, budget: 300, icon: Zap, color: 'var(--chart-4)' },
    { category: 'Entertainment', amount: 300, budget: 250, icon: ShoppingCart, color: 'var(--chart-5)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Expense Tracking</h2>
          <p className="text-muted-foreground">Monitor and categorize your spending</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total This Month</span>
            <TrendingDown className="w-5 h-5 text-chart-1" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$4,200</div>
          <p className="text-sm text-muted-foreground mt-1">72% of income</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Average Daily Spending</span>
            <TrendingDown className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$140</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Recurring Expenses</span>
            <TrendingDown className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$1,405/mo</div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Add New Expense</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Expense Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Grocery Shopping"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
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
              <label className="block text-card-foreground mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="recurring" className="text-card-foreground">Recurring expense</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Expense
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

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {categoryTotals.map((cat) => {
            const Icon = cat.icon;
            const percentage = (cat.amount / cat.budget) * 100;
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-card-foreground font-medium">{cat.category}</p>
                      <p className="text-sm text-muted-foreground">${cat.amount} of ${cat.budget} budget</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${percentage > 100 ? 'text-destructive' : 'text-chart-2'}`}>
                    {percentage.toFixed(0)}%
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: percentage > 100 ? 'var(--destructive)' : cat.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Monthly Spending Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyExpenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="amount" fill="var(--chart-1)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-chart-1/20 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-card-foreground">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • {expense.date}
                    {expense.recurring && ' • Recurring'}
                  </p>
                </div>
              </div>
              <p className="text-card-foreground font-semibold">-${expense.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
