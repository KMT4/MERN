import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Briefcase, DollarSign, Trash2 } from 'lucide-react';
import { getTransactions, createTransaction, deleteTransaction, Transaction } from '../../api/transactions';
import { getMonthlySummary } from '../../api/analytics';
import {getCurrencySymbol} from "../../utils/currency"
const INCOME_CATEGORIES = [
  'Employment',
  'Freelance',
  'Investments',
  'Real Estate',
  'Business',
  'Other',
];

export function Income() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(0);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Employment',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    isRecurring: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [txns, summary] = await Promise.all([
        getTransactions('income'),
        getMonthlySummary(),
      ]);
      setIncomes(txns);
      const incomeItem = summary.find((s) => s._id === 'income');
      setMonthlyIncomeTotal(incomeItem ? incomeItem.total : 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError('');
    try {
      await createTransaction({
        type: 'income',
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
        category: 'Employment',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: '',
        isRecurring: false,
      });
      setShowAddForm(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry?')) return;
    try {
      await deleteTransaction(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const incomeCount = incomes.length;
  const ytdIncome = incomes
    .filter((t) => new Date(t.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Income Tracking
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Manage your income sources
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Total This Month
            </span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{monthlyIncomeTotal.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Income Entries
            </span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {incomeCount}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              YTD Income
            </span>
            <Briefcase className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
          {getCurrencySymbol()}{ytdIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Add Income Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-5">
            Add New Income
          </h3>
          <form
            onSubmit={handleAddIncome}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Salary, Freelance"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Amount
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date
              </label>
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
                placeholder="e.g., Bank Transfer"
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="income-recurring"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                checked={form.isRecurring}
                onChange={(e) =>
                  setForm({ ...form, isRecurring: e.target.checked })
                }
              />
              <label
                htmlFor="income-recurring"
                className="text-sm text-foreground"
              >
                Recurring income
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Income'}
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

      {/* Income List */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-foreground mb-5">
          Income Entries
        </h3>
        {loading && (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        )}
        {!loading && incomes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No income recorded yet.
            </p>
          </div>
        )}
        <div className="space-y-2">
          {incomes.map((income) => (
            <div
              key={income._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {income.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {income.category} •{' '}
                    {new Date(income.date).toLocaleDateString()}
                    {income.isRecurring && ' • Recurring'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-emerald-600">
                  +{getCurrencySymbol()}{income.amount.toLocaleString()}
                </p>
                <button
                  onClick={() => handleDelete(income._id)}
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