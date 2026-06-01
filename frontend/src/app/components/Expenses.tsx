import { useState, useEffect } from 'react';
import { Plus, TrendingDown, Coffee, Home, Car, Zap, ShoppingCart, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTransactions, createTransaction, deleteTransaction, Transaction } from '../../api/transactions';
import { getMonthlySummary, getCategoryBreakdown, CategoryBreakdownItem } from '../../api/analytics';
import {getCurrencySymbol} from "../../utils/currency"
const EXPENSE_CATEGORIES = [
  'Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other',
];

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Housing: Home,
  Transportation: Car,
  Utilities: Zap,
  Shopping: ShoppingCart,
  Entertainment: ShoppingCart,
  Healthcare: Zap,
};

const categoryColors: Record<string, string> = {
  Food: 'var(--chart-2)',
  Housing: 'var(--chart-1)',
  Transportation: 'var(--chart-3)',
  Utilities: 'var(--chart-4)',
  Entertainment: 'var(--chart-5)',
  Healthcare: '#9CA3AF',
  Shopping: '#F59E0B',
  Other: '#6B7280',
};

export function Expenses() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    isRecurring: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [txns, summary, breakdown] = await Promise.all([
        getTransactions('expense'),
        getMonthlySummary(),
        getCategoryBreakdown(),
      ]);
      setExpenses(txns);
      const expenseItem = summary.find((s) => s._id === 'expense');
      setMonthlyExpenseTotal(expenseItem ? expenseItem.total : 0);
      setCategoryBreakdown(breakdown);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError('');
    try {
      await createTransaction({
        type: 'expense',
        amount,
        category: form.category,
        description: form.description || form.category,
        date: form.date,
        paymentMethod: form.paymentMethod,
        isRecurring: form.isRecurring,
      });
      setForm({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: '',
        isRecurring: false,
      });
      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteTransaction(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Derived metrics
  const avgDailySpending = monthlyExpenseTotal / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const recurringTotal = expenses
    .filter((t) => t.isRecurring)
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly spending chart (still computed from the transaction list)
  const monthlyChartData = getMonthlySpending(expenses);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Expense Tracking
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Monitor and categorize your spending
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total This Month</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{monthlyExpenseTotal.toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Average Daily</span>
            <TrendingDown className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{avgDailySpending.toFixed(0)}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Recurring</span>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{recurringTotal.toLocaleString()}/mo
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-5">Add New Expense</h3>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Grocery Shopping"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Payment Method
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Credit Card"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="expense-recurring"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              />
              <label htmlFor="expense-recurring" className="text-sm text-foreground">
                Recurring expense
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Expense'}
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

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-foreground mb-5">
          Spending by Category
        </h3>
        {categoryBreakdown.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {categoryBreakdown.map((cat) => {
              const Icon = categoryIcons[cat._id] || ShoppingCart;
              const color = categoryColors[cat._id] || '#6B7280';
              const percentage =
                monthlyExpenseTotal > 0 ? (cat.total / monthlyExpenseTotal) * 100 : 0;
              return (
                <div key={cat._id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat._id}</p>
                        <p className="text-xs text-muted-foreground">
                        {getCurrencySymbol()}{cat.total.toLocaleString()} spent
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Spending Trend Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-foreground mb-5">
          Monthly Spending Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            />
            <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Expenses List */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-foreground mb-5">
          Recent Expenses
        </h3>
        {loading && <p className="text-muted-foreground text-sm py-4">Loading...</p>}
        {!loading && expenses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No expenses found.</p>
          </div>
        )}
        <div className="space-y-2">
          {expenses.slice(0, 20).map((expense) => (
            <div
              key={expense._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {expense.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    {expense.isRecurring && ' • Recurring'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-red-600">
                  -{getCurrencySymbol()}{expense.amount.toLocaleString()}
                </p>
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper: groups transactions by month (last 6 months) for the chart
function getMonthlySpending(expenses: Transaction[]) {
  const months: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const total = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
    months.push({ month: monthName, amount: total });
  }
  return months;
}