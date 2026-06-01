import { useState, useEffect } from "react";
import {
  Plus,
  CreditCard,
  TrendingDown,
  DollarSign,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CalendarDays,
  ArrowDownRight,
  WalletCards,
  Gauge,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import {
  getLoans,
  getLoanSummary,
  createLoan,
  updateLoan,
  deleteLoan,
  Loan,
  LoanSummary,
} from "../../api/loans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  icon: any;
  tone?: "red" | "green" | "blue" | "amber" | "neutral";
}) {
  const toneClass = {
    red: "bg-red-500/10 text-red-500 ring-red-500/15",
    green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
    blue: "bg-blue-500/10 text-blue-500 ring-blue-500/15",
    amber: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
    neutral: "bg-primary/10 text-primary ring-primary/15",
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-muted-foreground">
            {label}
          </p>

          <h3 className="mt-2 truncate text-xl font-semibold tracking-tight text-card-foreground md:text-2xl">
            {value}
          </h3>
        </div>

        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
            toneClass[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function DebtsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

export function Debts() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary>({
    totalBorrowed: 0,
    totalRemaining: 0,
    outstandingLoans: 0,
    overdueLoans: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    lender: "",
    amountBorrowed: "",
    interestRate: "",
    dueDate: "",
  });

  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

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

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLoan.lender || !newLoan.amountBorrowed) return;

    setLoading(true);

    try {
      await createLoan({
        lender: newLoan.lender,
        amountBorrowed: parseFloat(newLoan.amountBorrowed),
        interestRate: newLoan.interestRate
          ? parseFloat(newLoan.interestRate)
          : undefined,
        dueDate: newLoan.dueDate || undefined,
      });

      setNewLoan({
        lender: "",
        amountBorrowed: "",
        interestRate: "",
        dueDate: "",
      });

      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add loan");
    } finally {
      setLoading(false);
    }
  };

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

  const getMonthsRemaining = (loan: Loan): number | null => {
    const monthlyPayment = loan.amountBorrowed * 0.05;

    if (loan.interestRate && loan.interestRate > 0) {
      const monthlyRate = loan.interestRate / 100 / 12;

      if (
        monthlyRate > 0 &&
        monthlyPayment > loan.amountRemaining * monthlyRate
      ) {
        return Math.ceil(
          Math.log(
            monthlyPayment /
              (monthlyPayment - loan.amountRemaining * monthlyRate),
          ) / Math.log(1 + monthlyRate),
        );
      }

      return Math.ceil(loan.amountRemaining / monthlyPayment);
    }

    return Math.ceil(loan.amountRemaining / monthlyPayment);
  };

  const highestInterestLoan = loans
    .filter((l) => l.interestRate)
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];

  const paidTotal = Math.max(
    0,
    summary.totalBorrowed - summary.totalRemaining,
  );

  const totalPaidPercentage =
    summary.totalBorrowed > 0
      ? (paidTotal / summary.totalBorrowed) * 100
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Debts
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Debts & Loans
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track balances, due dates, interest rates and repayments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
            Refresh
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Debt
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Debt/Loan</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleAddLoan}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="block text-card-foreground mb-2">
                Lender / Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., Student Loan, Bank of America"
                value={newLoan.lender}
                onChange={(e) =>
                  setNewLoan({ ...newLoan, lender: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-card-foreground mb-2">
                Amount Borrowed
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="0.00"
                value={newLoan.amountBorrowed}
                onChange={(e) =>
                  setNewLoan({
                    ...newLoan,
                    amountBorrowed: e.target.value,
                  })
                }
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-card-foreground mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                placeholder="e.g., 5.5"
                value={newLoan.interestRate}
                onChange={(e) =>
                  setNewLoan({
                    ...newLoan,
                    interestRate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-card-foreground mb-2">
                Due Date optional
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
                value={newLoan.dueDate}
                onChange={(e) =>
                  setNewLoan({ ...newLoan, dueDate: e.target.value })
                }
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

      {loading && loans.length === 0 ? (
        <DebtsSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Debt"
              value={formatCurrency(summary.totalRemaining)}
              helper={`${totalPaidPercentage.toFixed(0)}% paid down`}
              icon={CreditCard}
              tone="red"
            />

            <KpiCard
              label="Outstanding"
              value={summary.outstandingLoans.toLocaleString()}
              helper="Active unpaid loans"
              icon={WalletCards}
              tone="blue"
            />

            <KpiCard
              label="Borrowed"
              value={formatCurrency(summary.totalBorrowed)}
              helper={`${formatCurrency(paidTotal)} already paid`}
              icon={DollarSign}
              tone="neutral"
            />

            <KpiCard
              label="Overdue"
              value={summary.overdueLoans.toLocaleString()}
              helper={
                summary.overdueLoans > 0
                  ? "Needs attention"
                  : "No overdue loans"
              }
              icon={AlertTriangle}
              tone={summary.overdueLoans > 0 ? "red" : "green"}
            />
          </section>

          {highestInterestLoan && (
            <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-card to-emerald-500/10 p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/15">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Recommended Repayment Strategy
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Focus on{" "}
                    <strong className="text-card-foreground">
                      {highestInterestLoan.lender}
                    </strong>{" "}
                    first. It has the highest interest rate at{" "}
                    <strong className="text-card-foreground">
                      {highestInterestLoan.interestRate}%
                    </strong>
                    , so paying it down faster can reduce interest pressure.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Loan Accounts
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Manage remaining balances and record repayments.
                </p>
              </div>

              <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {loans.length} loan{loans.length === 1 ? "" : "s"}
              </span>
            </div>

            {loans.length === 0 ? (
              <div className="p-4">
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <ReceiptText className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    No debts recorded
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first debt or loan to start tracking repayments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
                {loans.map((loan) => {
                  const paidPercentage =
                    loan.amountBorrowed > 0
                      ? ((loan.amountBorrowed - loan.amountRemaining) /
                          loan.amountBorrowed) *
                        100
                      : 0;

                  const monthsRemaining = getMonthsRemaining(loan);

                  const isOverdue =
                    loan.dueDate &&
                    new Date(loan.dueDate) < new Date() &&
                    loan.amountRemaining > 0;

                  const paidAmount = loan.amountBorrowed - loan.amountRemaining;

                  return (
                    <article
                      key={loan._id}
                      className={cn(
                        "rounded-2xl border bg-background/40 p-4 transition-all hover:shadow-md",
                        isOverdue
                          ? "border-red-500/35"
                          : "border-border/80 hover:border-primary/25",
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                              isOverdue
                                ? "bg-red-500/10 text-red-500 ring-red-500/15"
                                : "bg-primary/10 text-primary ring-primary/15",
                            )}
                          >
                            <CreditCard className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-sm font-semibold text-card-foreground">
                                {loan.lender}
                              </h4>

                              {isOverdue && (
                                <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-500 ring-1 ring-red-500/15">
                                  Overdue
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {loan.interestRate
                                ? `${loan.interestRate}% APR`
                                : "No interest rate"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(loan._id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                          title="Delete loan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                              onChange={(e) =>
                                setPaymentAmount(e.target.value)
                              }
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

                      <div className="space-y-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Remaining
                            </p>

                            <p className="mt-1 text-lg font-semibold tracking-tight text-card-foreground">
                              {formatCurrency(loan.amountRemaining)}
                            </p>
                          </div>

                          <button
                            onClick={() => setPaymentLoanId(loan._id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-500/10 px-3 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20"
                          >
                            Record Payment
                          </button>
                        </div>

                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Paid down
                            </span>

                            <span className="font-semibold text-emerald-500">
                              {paidPercentage.toFixed(1)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{
                                width: `${Math.min(paidPercentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Original
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
                              {formatCurrency(loan.amountBorrowed)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Paid
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-emerald-500">
                              {formatCurrency(paidAmount)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">
                              Progress
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
                              {paidPercentage.toFixed(0)}%
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5" />
                            Est. {monthsRemaining ?? "—"} months remaining
                          </div>

                          {loan.dueDate && (
                            <div
                              className={cn(
                                "flex items-center gap-1.5",
                                isOverdue && "text-red-500",
                              )}
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                              Due{" "}
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {isOverdue && (
                          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
                            <p className="text-xs leading-5 text-red-500">
                              This loan is overdue and still has an outstanding
                              balance.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}