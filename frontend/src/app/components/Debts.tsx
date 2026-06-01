import { useState, useEffect } from "react";
import { Plus, CreditCard, TrendingDown, DollarSign, Trash2, RefreshCw } from "lucide-react";
import { getLoans, getLoanSummary, createLoan, updateLoan, deleteLoan, Loan, LoanSummary } from "../../api/loans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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

  // Calculate months remaining for a loan (assuming consistent monthly payment)
  const getMonthsRemaining = (loan: Loan): number | null => {
    // If no interest or monthly payment stored, we can't calculate precisely
    // We'll just use remaining amount / a guessed monthly payment (like 5% of original)
    const monthlyPayment = loan.amountBorrowed * 0.05; // 5% of original as default
    if (loan.interestRate && loan.interestRate > 0) {
      // Simple amortization: months = NPER(rate, -monthlyPayment, remaining)
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

  // Identify the highest-interest loan to suggest paying off first
  const highestInterestLoan = loans
    .filter((l) => l.interestRate)
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground mb-1">Debts & Loans</h2>
          <p className="text-muted-foreground">Manage your debts and repayment schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading...</p>}

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Debt/Loan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLoan} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-card-foreground mb-2">Lender / Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Student Loan, Bank of America"
                value={newLoan.lender}
                onChange={(e) => setNewLoan({ ...newLoan, lender: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Amount Borrowed</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
                value={newLoan.amountBorrowed}
                onChange={(e) => setNewLoan({ ...newLoan, amountBorrowed: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., 5.5"
                value={newLoan.interestRate}
                onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-card-foreground mb-2">Due Date (optional)</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                value={newLoan.dueDate}
                onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Saving..." : "Add Debt"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-full bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Debt</span>
                <CreditCard className="w-5 h-5 text-chart-1" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                ${summary.totalRemaining.toLocaleString()}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Outstanding Loans</span>
                <TrendingDown className="w-5 h-5 text-chart-3" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                {summary.outstandingLoans}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Original Borrowed</span>
                <DollarSign className="w-5 h-5 text-chart-2" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                ${summary.totalBorrowed.toLocaleString()}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Overdue</span>
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-2xl font-semibold text-card-foreground">
                {summary.overdueLoans}
              </div>
            </div>
          </div>

          {/* Loans List */}
          <div className="grid grid-cols-1 gap-4">
            {loans.map((loan) => {
              const paidPercentage =
                loan.amountBorrowed > 0
                  ? ((loan.amountBorrowed - loan.amountRemaining) / loan.amountBorrowed) * 100
                  : 0;
              const monthsRemaining = getMonthsRemaining(loan);
              const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.amountRemaining > 0;

              return (
                <div key={loan._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="w-12 h-12 bg-chart-1/20 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-chart-1" />
                      </div>
                      <div>
                        <h4 className="text-card-foreground">{loan.lender}</h4>
                        <p className="text-sm text-muted-foreground">
                          {loan.interestRate ? `${loan.interestRate}% APR` : "No interest"}
                          {isOverdue && <span className="text-destructive ml-2">Overdue</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <button
                        onClick={() => setPaymentLoanId(loan._id)}
                        className="px-3 py-1 text-sm bg-chart-2/10 text-chart-2 rounded-lg hover:bg-chart-2/20 transition-colors"
                      >
                        Record Payment
                      </button>
                      <button
                        onClick={() => handleDelete(loan._id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete loan"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <Dialog
                    open={paymentLoanId === loan._id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setPaymentLoanId(null);
                        setPaymentAmount("");
                      }
                    }}
                  >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="number"
                          className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                          placeholder="Payment amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                        />
                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                          <button
                            onClick={() => handleRecordPayment(loan._id)}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors sm:w-auto"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => {
                              setPaymentLoanId(null);
                              setPaymentAmount("");
                            }}
                            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className="font-semibold text-card-foreground">
                        ${loan.amountRemaining.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${paidPercentage}%`,
                          backgroundColor: "var(--chart-2)",
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Original</p>
                        <p className="font-semibold text-card-foreground">
                          ${loan.amountBorrowed.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-semibold text-chart-2">
                          ${(loan.amountBorrowed - loan.amountRemaining).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-semibold text-card-foreground">{paidPercentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    {monthsRemaining && (
                      <div className="pt-3 border-t border-border text-sm text-muted-foreground">
                        Est. months remaining: {monthsRemaining}
                        {loan.dueDate && ` | Due: ${new Date(loan.dueDate).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debt Payoff Strategy */}
          {highestInterestLoan && (
            <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 border border-chart-1/20 rounded-lg p-6">
              <h3 className="text-card-foreground mb-3">Recommended Repayment Strategy</h3>
              <p className="text-sm text-muted-foreground">
                Focus on paying off <strong className="text-card-foreground">{highestInterestLoan.lender}</strong> first
                (highest interest rate at {highestInterestLoan.interestRate}%). This will save you the most on interest charges.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
