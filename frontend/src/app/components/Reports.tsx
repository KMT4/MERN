import { useState, useEffect, useRef } from "react";
import {
  FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar,
  RefreshCw, Printer,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getTransactions, Transaction } from "../../api/transactions";
import { getInsights } from "../../api/ai";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const categoryColors: Record<string, string> = {
  Housing: "var(--chart-1)",
  Food: "var(--chart-2)",
  Transportation: "var(--chart-3)",
  Entertainment: "var(--chart-4)",
  Utilities: "var(--chart-5)",
  Other: "#9CA3AF",
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#9CA3AF",
];

const formatCurrency = (n: number) =>
  "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function Reports() {
  const reportRef = useRef<HTMLDivElement>(null);

  // Default date range: last 6 months
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
  const [startDate, setStartDate] = useState(sixMonthsAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch all transactions once (we'll filter client-side)
  const fetchAllTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch both income and expense (no type filter)
      const allTxns = await getTransactions();
      setTransactions(allTxns);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await getInsights();
      setAiSummary(res.insights.map((i) => i.message).join(" "));
    } catch {
      setAiSummary("AI summary unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
    fetchAiSummary();
  }, []);

  // Filter transactions based on selected date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // include entire end day
  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= start && d <= end;
  });

  // Separate income / expense
  const incomes = filtered.filter((tx) => tx.type === "income");
  const expenses = filtered.filter((tx) => tx.type === "expense");

  // Summary calculations
  const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category breakdown (expenses)
  const categoryMap = new Map<string, number>();
  expenses.forEach((tx) => {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  });
  const categoryBreakdown = Array.from(categoryMap, ([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#6B7280",
  })).sort((a, b) => b.value - a.value);

  // Income sources (pie)
  const incomeSourceMap = new Map<string, number>();
  incomes.forEach((tx) => {
    incomeSourceMap.set(tx.category, (incomeSourceMap.get(tx.category) || 0) + tx.amount);
  });
  const incomeSources = Array.from(incomeSourceMap, ([name, value]) => ({ name, value }));

  // Monthly trend (group by month/year)
  const trendMap = new Map<string, { income: number; expenses: number }>();
  filtered.forEach((tx) => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = trendMap.get(key) || { income: 0, expenses: 0 };
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expenses += tx.amount;
    trendMap.set(key, entry);
  });
  const monthlyTrend = Array.from(trendMap, ([key, val]) => {
    const [y, m] = key.split("-");
    const monthName = new Date(Number(y), Number(m) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
    return { month: monthName, ...val, net: val.income - val.expenses };
  }).sort((a, b) => a.month.localeCompare(b.month));

  // Cash flow table (cumulative)
  let cumBalance = 0;
  const cashFlow = monthlyTrend.map((m) => {
    cumBalance += m.net;
    return { ...m, cumulative: cumBalance };
  });

  // Key metrics
  const numMonths = cashFlow.length || 1;
  const metrics = [
    { label: "Average Monthly Income", value: formatCurrency(totalIncome / numMonths) },
    { label: "Average Monthly Expenses", value: formatCurrency(totalExpenses / numMonths) },
    { label: "Net Savings", value: formatCurrency(netSavings) },
    { label: "Savings Rate", value: savingsRate.toFixed(1) + "%" },
  ];

  // PDF export
  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`financial-report-${startDate}-to-${endDate}.pdf`);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Financial Reports</h2>
          <p className="text-muted-foreground">Comprehensive analysis of your financial data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5" /> Export PDF
          </button>
          <button onClick={printReport} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
            <Printer className="w-5 h-5" /> Print
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          Showing {filtered.length} transactions
        </span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading ? (
        <p className="text-muted-foreground">Loading transactions...</p>
      ) : (
        <div ref={reportRef} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Income</span>
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">{formatCurrency(totalIncome)}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Expenses</span>
                <TrendingDown className="w-5 h-5 text-chart-1" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">{formatCurrency(totalExpenses)}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Net Savings</span>
                <DollarSign className="w-5 h-5 text-chart-4" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">{formatCurrency(netSavings)}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Savings Rate</span>
                <Calendar className="w-5 h-5 text-chart-3" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">{savingsRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Income vs Expenses Bar Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-card-foreground mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="income" fill="var(--chart-2)" name="Income" />
                <Bar dataKey="expenses" fill="var(--chart-1)" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net Cash Flow & Income Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-card-foreground mb-4">Net Cash Flow</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="net" stroke="var(--chart-4)" strokeWidth={3} name="Net Cash Flow" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-card-foreground mb-4">Income Sources</h3>
              {incomeSources.length === 0 ? (
                <p className="text-muted-foreground">No income data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeSources.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cash Flow Statement */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-card-foreground mb-4">Cash Flow Statement</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-muted-foreground">Month</th>
                    <th className="py-2 text-muted-foreground">Income</th>
                    <th className="py-2 text-muted-foreground">Expenses</th>
                    <th className="py-2 text-muted-foreground">Net</th>
                    <th className="py-2 text-muted-foreground">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlow.map((row, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="py-2 text-card-foreground">{row.month}</td>
                      <td className="py-2 text-card-foreground">{formatCurrency(row.income)}</td>
                      <td className="py-2 text-card-foreground">{formatCurrency(row.expenses)}</td>
                      <td className={`py-2 font-semibold ${row.net >= 0 ? "text-chart-2" : "text-destructive"}`}>
                        {formatCurrency(row.net)}
                      </td>
                      <td className="py-2 text-card-foreground">{formatCurrency(row.cumulative)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-card-foreground mb-4">Key Financial Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="p-4 bg-accent rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{m.label}</p>
                  <p className="text-xl font-semibold text-card-foreground">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-chart-3/10 to-chart-2/10 border border-chart-3/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-chart-3" />
              <h3 className="text-card-foreground">AI-Generated Report Summary</h3>
            </div>
            {aiLoading ? (
              <p className="text-muted-foreground">Generating summary...</p>
            ) : (
              <p className="text-card-foreground whitespace-pre-line">{aiSummary}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}