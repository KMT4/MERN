import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Sparkles, Target } from 'lucide-react';

import api from '../../api/axios';

interface BalanceData {
  income: number;
  expense: number;
  balance: number;
}

interface MonthlyDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}
interface CategoryDataPoint{
  name: string;
  value: number;
  color: string;
}

interface Insight {
  type: string;
  icon: any;
  color: string;
  message: string;
}
interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}


export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all required data in parallel
        const [balanceRes, monthlyRes, categoryRes, insightsRes, transactionsRes] = await Promise.all([
          api.get('/analytics/balance'),
          api.get('/analytics/monthly-summary'),
          api.get('/analytics/category-breakdown'),
          api.get('/insights/spending-insights'), // using the existing insight endpoint
          api.get('/transactions?limit=5')
        ]);

        setBalanceData(balanceRes.data);
        
        // Transform monthly summary if needed (depends on actual response)
        // Assuming monthlyRes.data is array of { month, income, expenses, savings }
        setMonthlyData(monthlyRes.data);
        
        // Transform category breakdown to match expected format
        const formattedCategories = categoryRes.data.map((item: any, index: number) => ({
          name: item._id,
          value: item.total,
          color: `var(--chart-${(index % 5) + 1})`
        }));
        setCategoryData(formattedCategories);
        
        // Format insights from spending-insights endpoint
        const insightsData = insightsRes.data;
        const formattedInsights: Insight[] = [
          {
            type: 'warning',
            icon: AlertTriangle,
            color: 'text-destructive',
            message: `Your top spending category is ${insightsData.topSpendingCategory || 'N/A'} with $${insightsData.topCategoryAmount || 0}`
          },
          {
            type: 'tip',
            icon: Sparkles,
            color: 'text-chart-2',
            message: `Total expenses: $${insightsData.summary?.totalExpenses || 0}`
          },
          {
            type: 'goal',
            icon: Target,
            color: 'text-chart-4',
            message: 'Keep tracking your goals to stay on target'
          }
        ];
        setInsights(formattedInsights);
        
        setRecentTransactions(transactionsRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading dashboard...</div>;
  }

  if (error || !balanceData) {
    return <div className="text-destructive text-center p-8">{error || 'Unable to load data'}</div>;
  }

  const monthlyIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / (monthlyData.length || 1);
  const monthlyExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / (monthlyData.length || 1);
  const savingsRate = balanceData.income > 0 ? ((balanceData.income - balanceData.expense) / balanceData.income * 100).toFixed(0) : 0;

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
            <LineChart data={monthlyData}>
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
          {insights.map((insight, index) => {
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
