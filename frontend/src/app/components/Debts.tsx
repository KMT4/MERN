import { useState } from 'react';
import { Plus, CreditCard, TrendingDown } from 'lucide-react';

export function Debts() {
  const [showAddForm, setShowAddForm] = useState(false);

  const debts = [
    {
      id: 1,
      name: 'Student Loan',
      type: 'Education',
      totalAmount: 25000,
      remainingBalance: 18500,
      interestRate: 4.5,
      monthlyPayment: 350,
      nextPaymentDate: 'May 15, 2026',
      color: 'var(--chart-1)'
    },
    {
      id: 2,
      name: 'Car Loan',
      type: 'Auto',
      totalAmount: 20000,
      remainingBalance: 12000,
      interestRate: 3.9,
      monthlyPayment: 400,
      nextPaymentDate: 'May 10, 2026',
      color: 'var(--chart-2)'
    },
    {
      id: 3,
      name: 'Credit Card',
      type: 'Credit Card',
      totalAmount: 5000,
      remainingBalance: 2500,
      interestRate: 18.9,
      monthlyPayment: 200,
      nextPaymentDate: 'May 20, 2026',
      color: 'var(--chart-3)'
    },
  ];

  const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.remainingBalance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Debts & Loans</h2>
          <p className="text-muted-foreground">Manage your debts and repayment schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Debt</span>
            <CreditCard className="w-5 h-5 text-chart-1" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${totalDebt.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Monthly Payments</span>
            <TrendingDown className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${totalMonthlyPayment.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Paid</span>
            <TrendingDown className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${totalPaid.toLocaleString()}</div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Add Debt/Loan</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-card-foreground mb-2">Debt Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Student Loan"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Type</label>
              <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
                <option>Credit Card</option>
                <option>Auto Loan</option>
                <option>Student Loan</option>
                <option>Mortgage</option>
                <option>Personal Loan</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Total Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Current Balance</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Monthly Payment</label>
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
                Add Debt
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

      <div className="grid grid-cols-1 gap-4">
        {debts.map((debt) => {
          const paidPercentage = ((debt.totalAmount - debt.remainingBalance) / debt.totalAmount) * 100;
          const monthsRemaining = Math.ceil(debt.remainingBalance / debt.monthlyPayment);

          return (
            <div key={debt.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${debt.color}20` }}>
                    <CreditCard className="w-6 h-6" style={{ color: debt.color }} />
                  </div>
                  <div>
                    <h4 className="text-card-foreground">{debt.name}</h4>
                    <p className="text-sm text-muted-foreground">{debt.type} • {debt.interestRate}% APR</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="font-semibold text-card-foreground">${debt.monthlyPayment}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span className="font-semibold text-card-foreground">${debt.remainingBalance.toLocaleString()}</span>
                </div>

                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${paidPercentage}%`,
                      backgroundColor: debt.color
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original</p>
                    <p className="font-semibold text-card-foreground">${debt.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-semibold" style={{ color: debt.color }}>
                      ${(debt.totalAmount - debt.remainingBalance).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-semibold text-card-foreground">{paidPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next payment: {debt.nextPaymentDate}</span>
                  <span className="text-muted-foreground">~{monthsRemaining} months remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 border border-chart-1/20 rounded-lg p-6">
        <h3 className="text-card-foreground mb-3">Debt Payoff Strategy</h3>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Consider paying off your Credit Card first (highest interest rate at 18.9%) to minimize interest charges.
          </p>
          <p className="text-muted-foreground">
            With an extra $100/month payment, you could save $450 in interest and pay off 3 months earlier.
          </p>
        </div>
      </div>
    </div>
  );
}
