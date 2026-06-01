import { useState, useEffect } from "react";
import { Plus, CreditCard, TrendingDown, DollarSign, Trash2, RefreshCw } from "lucide-react";
import { getLoans, getLoanSummary, createLoan, updateLoan, deleteLoan, Loan, LoanSummary } from "../../api/loans";
import {getCurrencySymbol} from "../../utils/currency"
export function Debts() {
  // State
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary>({
    totalBorrowed: 0,
    totalRemaining: 0,
    outstandingLoans: 0,
    overdueLoans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    lender: "",
    amountBorrowed: "",
    interestRate: "",
    dueDate: "",
  });

  // Payment form state
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [loansRes, summaryRes] = await Promise.all([
        getLoans(),
        getLoanSummary(),
      ]);
      setLoans(loansRes.loans);
      setSummary(summaryRes.summary);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load debt data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add loan handler
  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.lender || !newLoan.amountBorrowed) return;

    setLoading(true);
    try {
      await createLoan({
        lender: newLoan.lender,
        amountBorrowed: parseFloat(newLoan.amountBorrowed),
        interestRate: newLoan.interestRate ? parseFloat(newLoan.interestRate) : undefined,
        dueDate: newLoan.dueDate || undefined,
      });
      setNewLoan({ lender: "", amountBorrowed: "", interestRate: "", dueDate: "" });
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add loan");
    } finally {
      setLoading(false);
    }
  };

  // Delete loan handler
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this loan? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteLoan(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete loan");
    } finally {
      setLoading(false);
    }
  };

  // Record payment
  const handleRecordPayment = async (loanId: string) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    const loan = loans.find((l) => l._id === loanId);
    if (!loan) return;

    const newRemaining = Math.max(0, loan.amountRemaining - amount);
    setLoading(true);
    try {
      await updateLoan(loanId, { amountRemaining: newRemaining });
      setPaymentAmount("");
      setPaymentLoanId(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  // Calculate months remaining for a loan
  const getMonthsRemaining = (loan: Loan): number | null => {
    const monthlyPayment = loan.amountBorrowed * 0.05; // 5% of original as default
    if (loan.interestRate && loan.interestRate > 0) {
      const monthlyRate = loan.interestRate / 100 / 12;
      if (monthlyRate > 0 && monthlyPayment > loan.amountRemaining * monthlyRate) {
        return Math.ceil(
          Math.log(monthlyPayment / (monthlyPayment - loan.amountRemaining * monthlyRate)) /
            Math.log(1 + monthlyRate)
        );
      }
      return Math.ceil(loan.amountRemaining / monthlyPayment);
    }
    return Math.ceil(loan.amountRemaining / monthlyPayment);
  };

  // Identify the highest-interest loan
  const highestInterestLoan = loans
    .filter((l) => l.interestRate)
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Debts & Loans
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Manage your debts and repayment schedules
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Debt
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Debt</span>
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
              {getCurrencySymbol()}{summary.totalRemaining.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Outstanding Loans</span>
                <TrendingDown className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {summary.outstandingLoans}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Original Borrowed</span>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
              {getCurrencySymbol()}{summary.totalBorrowed.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Overdue</span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {summary.overdueLoans}
              </div>
            </div>
          </div>

          {/* Add Loan Form */}
          {showAddForm && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-5">
                Add New Debt/Loan
              </h3>
              <form onSubmit={handleAddLoan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Lender / Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Student Loan, Bank of America"
                    value={newLoan.lender}
                    onChange={(e) => setNewLoan({ ...newLoan, lender: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount Borrowed
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="0.00"
                    value={newLoan.amountBorrowed}
                    onChange={(e) => setNewLoan({ ...newLoan, amountBorrowed: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., 5.5"
                    value={newLoan.interestRate}
                    onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={newLoan.dueDate}
                    onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Add Debt"}
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

          {/* Loans List */}
          {loans.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <CreditCard className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No debts recorded</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first loan to start tracking repayment.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Debt
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {loans.map((loan) => {
                const paidPercentage =
                  loan.amountBorrowed > 0
                    ? ((loan.amountBorrowed - loan.amountRemaining) / loan.amountBorrowed) * 100
                    : 0;
                const monthsRemaining = getMonthsRemaining(loan);
                const isOverdue =
                  loan.dueDate && new Date(loan.dueDate) < new Date() && loan.amountRemaining > 0;

                return (
                  <div
                    key={loan._id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-foreground">
                            {loan.lender}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {loan.interestRate ? `${loan.interestRate}% APR` : "No interest"}
                            {isOverdue && (
                              <span className="text-red-600 font-medium ml-2">• Overdue</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPaymentLoanId(loan._id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => handleDelete(loan._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete loan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Payment Form */}
                    {paymentLoanId === loan._id && (
                      <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Payment amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                          />
                          <button
                            onClick={() => handleRecordPayment(loan._id)}
                            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => {
                              setPaymentLoanId(null);
                              setPaymentAmount("");
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Remaining Balance</span>
                        <span className="font-semibold text-foreground">
                        {getCurrencySymbol()}{loan.amountRemaining.toLocaleString()}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${paidPercentage}%`,
                            backgroundColor: "var(--chart-2)",
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Original</p>
                          <p className="font-semibold text-foreground">
                          {getCurrencySymbol()}{loan.amountBorrowed.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Paid</p>
                          <p className="font-semibold text-emerald-600">
                          {getCurrencySymbol()}{(loan.amountBorrowed - loan.amountRemaining).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Progress</p>
                          <p className="font-semibold text-foreground">
                            {paidPercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {monthsRemaining && (
                        <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-3">
                          <span>Est. months remaining: {monthsRemaining}</span>
                          {loan.dueDate && (
                            <span>• Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Debt Payoff Strategy */}
          {highestInterestLoan && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-3">
                Recommended Repayment Strategy
              </h3>
              <p className="text-sm text-gray-600">
                Focus on paying off{" "}
                <strong className="text-foreground">{highestInterestLoan.lender}</strong> first
                (highest interest rate at {highestInterestLoan.interestRate}%). This will save you the
                most on interest charges.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}