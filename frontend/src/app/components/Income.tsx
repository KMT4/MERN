import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Briefcase, DollarSign, Trash2 } from 'lucide-react';
import { getTransactions, createTransaction, deleteTransaction, Transaction } from '../../api/transactions';
import { getMonthlySummary } from '../../api/analytics';

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
      // Reset form and refresh
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

  // Derived from already‑loaded list (lightweight)
  const incomeCount = incomes.length;
  const ytdIncome = incomes
    .filter((t) => new Date(t.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Income Tracking</h2>
          <p className="text-muted-foreground">Manage your income sources</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total This Month</span>
            <DollarSign className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            ${monthlyIncomeTotal.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Income Entries</span>
            <TrendingUp className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            {incomeCount}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">YTD Income</span>
            <Briefcase className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">
            ${ytdIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Add Income Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Add New Income</h3>
          <form onSubmit={handleAddIncome} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Description</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Salary, Freelance"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Category</label>
              <select
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Payment Method</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Bank Transfer"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="income-recurring"
                className="w-4 h-4 rounded border-border"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              />
              <label htmlFor="income-recurring" className="text-card-foreground">Recurring income</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Income'}
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

      {/* Income List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Income Entries</h3>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {!loading && incomes.length === 0 && (
          <p className="text-muted-foreground">No income recorded yet.</p>
        )}
        <div className="space-y-3">
          {incomes.map((income) => (
            <div
              key={income._id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-card-foreground font-medium">{income.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {income.category} • {new Date(income.date).toLocaleDateString()}
                    {income.isRecurring && ' • Recurring'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xl font-semibold text-chart-2">
                  +${income.amount.toLocaleString()}
                </p>
                <button
                  onClick={() => handleDelete(income._id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}