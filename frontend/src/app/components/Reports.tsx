import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const annualData = [
  { month: 'Jan', income: 5200, expenses: 3800, net: 1400 },
  { month: 'Feb', income: 5200, expenses: 4100, net: 1100 },
  { month: 'Mar', income: 5500, expenses: 3900, net: 1600 },
  { month: 'Apr', income: 5200, expenses: 4300, net: 900 },
  { month: 'May', income: 5800, expenses: 4200, net: 1600 },
];

export function Reports() {
  const totalIncome = annualData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = annualData.reduce((sum, m) => sum + m.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = ((netSavings / totalIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Financial Reports</h2>
          <p className="text-muted-foreground">Analyze your financial performance</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">YTD Income</span>
            <TrendingUp className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${totalIncome.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">YTD Expenses</span>
            <TrendingDown className="w-5 h-5 text-chart-1" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${totalExpenses.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Net Savings</span>
            <DollarSign className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">${netSavings.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Savings Rate</span>
            <Calendar className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">{savingsRate}%</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-card-foreground">Income vs Expenses Report</h3>
          <select className="px-4 py-2 bg-input-background rounded-lg border border-border outline-none">
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={annualData}>
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
            <Legend />
            <Bar dataKey="income" fill="var(--chart-2)" name="Income" />
            <Bar dataKey="expenses" fill="var(--chart-1)" name="Expenses" />
            <Bar dataKey="net" fill="var(--chart-4)" name="Net Savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={annualData}>
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
              <Line type="monotone" dataKey="net" stroke="var(--chart-4)" strokeWidth={3} name="Net Cash Flow" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Key Financial Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Average Monthly Income', value: '$5,380', change: '+8.2%', positive: true },
              { label: 'Average Monthly Expenses', value: '$4,060', change: '+3.1%', positive: false },
              { label: 'Average Monthly Savings', value: '$1,320', change: '+18.5%', positive: true },
              { label: 'Debt-to-Income Ratio', value: '32%', change: '-2.1%', positive: true },
            ].map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="font-semibold text-card-foreground">{metric.value}</p>
                </div>
                <span className={metric.positive ? 'text-chart-2' : 'text-chart-1'}>
                  {metric.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Top Spending Categories (YTD)</h3>
        <div className="space-y-3">
          {[
            { category: 'Housing', amount: 6000, percentage: 29, color: 'var(--chart-1)' },
            { category: 'Food & Dining', amount: 3000, percentage: 15, color: 'var(--chart-2)' },
            { category: 'Transportation', amount: 2000, percentage: 10, color: 'var(--chart-3)' },
            { category: 'Utilities', amount: 1250, percentage: 6, color: 'var(--chart-4)' },
            { category: 'Entertainment', amount: 1500, percentage: 7, color: 'var(--chart-5)' },
            { category: 'Other', amount: 6850, percentage: 33, color: '#9CA3AF' },
          ].map((cat, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-card-foreground">{cat.category}</span>
                <span className="text-muted-foreground">${cat.amount.toLocaleString()} ({cat.percentage}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Tax Summary (2026 YTD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Tax Paid</p>
            <p className="text-xl font-semibold text-card-foreground">$6,450</p>
            <p className="text-xs text-muted-foreground mt-1">Federal & State</p>
          </div>
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Deductible Expenses</p>
            <p className="text-xl font-semibold text-card-foreground">$1,200</p>
            <p className="text-xs text-muted-foreground mt-1">Business & Charitable</p>
          </div>
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Effective Tax Rate</p>
            <p className="text-xl font-semibold text-card-foreground">24%</p>
            <p className="text-xs text-muted-foreground mt-1">Of gross income</p>
          </div>
        </div>
      </div>
    </div>
  );
}
