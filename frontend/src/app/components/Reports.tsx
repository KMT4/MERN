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
import {getCurrencySymbol} from "../../utils/currency"

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
  getCurrencySymbol() + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Financial Reports
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Comprehensive analysis of your financial data
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={printReport}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          Showing {filtered.length} transactions
        </span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading ? (
        <p className="text-muted-foreground text-sm py-4">Loading transactions...</p>
      ) : (
        <div ref={reportRef} className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Income</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Net Savings</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(netSavings)}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Savings Rate</span>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {savingsRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Income vs Expenses Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-5">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="var(--chart-2)" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--chart-1)" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net Cash Flow & Income Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-5">Net Cash Flow</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    dot={false}
                    name="Net Cash Flow"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-5">Income Sources</h3>
              {incomeSources.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No income data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeSources.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cash Flow Statement */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-5">Cash Flow Statement</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cashFlow.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground">{row.month}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatCurrency(row.income)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatCurrency(row.expenses)}</td>
                      <td className={`py-3 px-4 text-sm font-semibold ${row.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(row.net)}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatCurrency(row.cumulative)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-5">Key Financial Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                  <p className="text-xl font-semibold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-foreground">AI-Generated Report Summary</h3>
            </div>
            {aiLoading ? (
              <p className="text-sm text-gray-500">Generating summary...</p>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-line">{aiSummary}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}