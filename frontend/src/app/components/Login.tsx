import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { loginUser, registerUser } from "../../api/auth";
import { getUserProfile } from "../../api/user";

interface LoginProps {
  onLogin: () => void;
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

      // Fetch currency from profile and store
      try {
        const user = await getUserProfile();
        localStorage.setItem("currency", user.currency || "USD");
      } catch (err) {
        console.error("Failed to load user profile after login", err);
      }

      onLogin(); // move to dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            FinanceTracker
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Personal Finance Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter your full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSignup ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-muted-foreground">
          <p>Secure • Encrypted • Privacy-First</p>
        </div>
      </div>
    </div>
  );
}
