import { useState } from 'react';
import { Plus, TrendingUp, Briefcase, DollarSign } from 'lucide-react';

export function Income() {
  const [showAddForm, setShowAddForm] = useState(false);

  const incomeStreams = [
    { id: 1, name: 'Primary Salary', amount: 5000, frequency: 'Monthly', category: 'Employment', nextPayment: 'May 15, 2026' },
    { id: 2, name: 'Freelance Work', amount: 800, frequency: 'Variable', category: 'Freelance', nextPayment: 'As received' },
    { id: 3, name: 'Investment Dividends', amount: 150, frequency: 'Quarterly', category: 'Investments', nextPayment: 'Jun 30, 2026' },
    { id: 4, name: 'Rental Income', amount: 600, frequency: 'Monthly', category: 'Real Estate', nextPayment: 'May 1, 2026' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Monthly Income</span>
            <DollarSign className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$5,800</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Active Income Streams</span>
            <TrendingUp className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">4</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">YTD Income</span>
            <Briefcase className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$26,450</div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Add New Income Source</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Income Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Salary, Freelance"
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
              <label className="block text-card-foreground mb-2">Frequency</label>
              <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
                <option>Monthly</option>
                <option>Bi-weekly</option>
                <option>Weekly</option>
                <option>Quarterly</option>
                <option>Annually</option>
                <option>Variable</option>
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Category</label>
              <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
                <option>Employment</option>
                <option>Freelance</option>
                <option>Investments</option>
                <option>Real Estate</option>
                <option>Business</option>
                <option>Other</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Income Source
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
        <h3 className="text-card-foreground mb-4">Income Sources</h3>
        <div className="space-y-3">
          {incomeStreams.map((income) => (
            <div key={income.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-card-foreground font-medium">{income.name}</p>
                  <p className="text-sm text-muted-foreground">{income.category} • {income.frequency}</p>
                  <p className="text-xs text-muted-foreground mt-1">Next: {income.nextPayment}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-chart-2">+${income.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{income.frequency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
