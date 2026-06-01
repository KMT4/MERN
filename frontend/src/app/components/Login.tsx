import { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Loader2, Wallet } from "lucide-react";
import { loginUser, registerUser } from "../../api/auth";

interface LoginProps {
  onLogin: () => void;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Login({ onLogin }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        await registerUser({
          fullName,
          email,
          password,
        });
      }

      const res = await loginUser({
        email,
        password,
      });

      localStorage.setItem("token", res.token);
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/10";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid-cols-[1fr_0.92fr]">
          <div className="relative hidden overflow-hidden border-r border-border bg-muted/30 p-8 md:block">
            <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-chart-2/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Secure finance workspace
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Wallet className="h-6 w-6" />
                </div>

                <h1 className="mt-6 max-w-sm text-3xl font-semibold tracking-tight text-foreground">
                  Smarter control over your money.
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  Track income, spending, savings, and AI-powered insights from
                  a clean personal finance dashboard.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-background/70 p-3">
                  <p className="text-lg font-semibold text-foreground">AI</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Insights
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-3">
                  <p className="text-lg font-semibold text-foreground">24/7</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tracking
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-3">
                  <p className="text-lg font-semibold text-foreground">Safe</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Private
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 md:p-8">
            <div className="mb-6 text-center md:text-left">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm md:mx-0 md:hidden">
                <Wallet className="h-5 w-5" />
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                FinanceTracker
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isSignup
                  ? "Start managing your finances in minutes."
                  : "Sign in to continue to your dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignup && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-card-foreground">
                    Full name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Geremy Clarkson"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-card-foreground">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-xs font-medium text-card-foreground">
                    Password
                  </label>

                  {!isSignup && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignup
                  ? loading
                    ? "Creating account..."
                    : "Create account"
                  : loading
                    ? "Signing in..."
                    : "Sign in"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
                className="font-medium text-primary hover:underline"
              >
                {isSignup ? "Sign in" : "Create account"}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Encrypted access • Privacy-first • Secure session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}