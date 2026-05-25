import { useState, useEffect } from 'react';
import { Plus, TrendingDown, ShoppingCart, Coffee, Home, Car, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';


interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
}

interface CategoryTotal {
  category: string;
  amount: number;
  budget?: number; // optional, can be fetched separately
  icon: any;
  color: string;
}

const categoryIcons: Record<string, any> = { Food: Coffee, Housing: Home, Transportation: Car, Utilities: Zap, Shopping: ShoppingCart, Entertainment: ShoppingCart };
const categoryColors: Record<string, string> = { Housing: 'var(--chart-1)', Food: 'var(--chart-2)', Transportation: 'var(--chart-3)', Utilities: 'var(--chart-4)', Entertainment: 'var(--chart-5)', Shopping: 'var(--chart-5)' };

export function Expenses() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
    type: 'expense'
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/transactions?type=expense');
      // filter client-side to only expenses (or backend can accept query param)
      const all = res.data;
      const expenseOnly = all.filter((t: any) => t.type === 'expense');
      setExpenses(expenseOnly);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', { ...newExpense, type: 'expense' });
      setShowAddForm(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to add expense', err);
    }
  };

  const totalThisMonth = expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((sum, e) => sum + e.amount, 0);
  const avgDaily = totalThisMonth / (new Date().getDate() || 1);
  const recurringTotal = expenses.filter(e => e.isRecurring).reduce((sum, e) => sum + e.amount, 0);

  // Category totals
  const categoryTotals: CategoryTotal[] = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    category,
    amount,
    icon: categoryIcons[category] || ShoppingCart,
    color: categoryColors[category] || 'var(--chart-5)'
  }));

  // Monthly trend: group by month
  const monthlyExpenses = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const monthlyData = Object.entries(monthlyExpenses).map(([month, amount]) => ({ month, amount }));

  if (loading) return <div className="text-center p-8">Loading expenses...</div>;
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;

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
            const percentage = (cat.amount / totalThisMonth) * 100;
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
          <BarChart data={monthlyData}>
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
          {expenses.slice(0, 10).map((expense) => (
            <div key={expense._id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-chart-1/20 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-card-foreground">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    {expense.isRecurring && ' • Recurring'}
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
