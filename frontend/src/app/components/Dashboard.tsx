import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Sparkles, Target } from 'lucide-react';

const spendingData = [
  { month: 'Jan', income: 5200, expenses: 3800, savings: 1400 },
  { month: 'Feb', income: 5200, expenses: 4100, savings: 1100 },
  { month: 'Mar', income: 5500, expenses: 3900, savings: 1600 },
  { month: 'Apr', income: 5200, expenses: 4300, savings: 900 },
  { month: 'May', income: 5800, expenses: 4200, savings: 1600 },
];

const categoryData = [
  { name: 'Housing', value: 1200, color: 'var(--chart-1)' },
  { name: 'Food', value: 600, color: 'var(--chart-2)' },
  { name: 'Transportation', value: 400, color: 'var(--chart-3)' },
  { name: 'Entertainment', value: 300, color: 'var(--chart-4)' },
  { name: 'Utilities', value: 250, color: 'var(--chart-5)' },
  { name: 'Other', value: 450, color: '#9CA3AF' },
];

const aiInsights = [
  { type: 'warning', icon: AlertTriangle, color: 'text-destructive', message: 'Your entertainment spending is 23% higher than last month' },
  { type: 'tip', icon: Sparkles, color: 'text-chart-2', message: 'You could save $180/month by reducing dining out expenses by 30%' },
  { type: 'goal', icon: Target, color: 'text-chart-4', message: "You're on track to reach your emergency fund goal in 4 months" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-1">Financial Overview</h2>
        <p className="text-muted-foreground">Track your finances at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Balance</span>
            <DollarSign className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$24,580</div>
          <p className="text-sm text-chart-2 mt-1">+12.5% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Monthly Income</span>
            <TrendingUp className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$5,800</div>
          <p className="text-sm text-chart-2 mt-1">+11.5% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Monthly Expenses</span>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">$4,200</div>
          <p className="text-sm text-muted-foreground mt-1">72% of income</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Savings Rate</span>
            <Target className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">28%</div>
          <p className="text-sm text-chart-2 mt-1">Above target of 20%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
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
              <Line type="monotone" dataKey="income" stroke="var(--chart-2)" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="var(--chart-1)" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="var(--chart-4)" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-card-foreground mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-chart-3/10 to-chart-2/10 border border-chart-3/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-chart-3" />
          <h3 className="text-card-foreground">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 bg-card/50 rounded-lg p-4">
                <Icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                <p className="text-card-foreground">{insight.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { name: 'Salary Deposit', amount: 5800, type: 'income', date: 'May 1, 2026', category: 'Salary' },
            { name: 'Rent Payment', amount: -1200, type: 'expense', date: 'May 1, 2026', category: 'Housing' },
            { name: 'Grocery Shopping', amount: -156, type: 'expense', date: 'May 3, 2026', category: 'Food' },
            { name: 'Freelance Project', amount: 800, type: 'income', date: 'May 5, 2026', category: 'Freelance' },
            { name: 'Electric Bill', amount: -85, type: 'expense', date: 'May 7, 2026', category: 'Utilities' },
          ].map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-chart-2/20' : 'bg-chart-1/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-chart-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-chart-1" />
                  )}
                </div>
                <div>
                  <p className="text-card-foreground">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-chart-2' : 'text-card-foreground'
              }`}>
                {transaction.type === 'income' ? '+' : ''}{transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
