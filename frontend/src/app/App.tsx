import { useState } from 'react';
import { Menu, Wallet } from 'lucide-react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Income } from './components/Income';
import { Expenses } from './components/Expenses';
import { Budgets } from './components/Budgets';
import { Savings } from './components/Savings';
import { Debts } from './components/Debts';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

export default function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('token') !== null
  );
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    income: 'Income',
    expenses: 'Expenses',
    budgets: 'Budgets',
    savings: 'Savings Goals',
    debts: 'Debts & Loans',
    reports: 'Reports',
    settings: 'Settings',
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');   // clear stored token
    setIsAuthenticated(false);
    setActiveView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

 
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'income': return <Income />;
      case 'expenses': return <Expenses />;
      case 'budgets': return <Budgets />;
      case 'savings': return <Savings />;
      case 'debts': return <Debts />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="size-full bg-background lg:flex">
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-foreground">
                {viewTitles[activeView] || 'Dashboard'}
              </p>
              <p className="truncate text-xs text-muted-foreground">FinanceTracker</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
