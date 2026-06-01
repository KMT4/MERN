import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  FileText,
  Settings,
  Target,
  LogOut,
 
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
 
}

export function Sidebar({ activeView, setActiveView, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "income", label: "Income", icon: TrendingUp },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "savings", label: "Savings Goals", icon: PiggyBank },
    { id: "debts", label: "Debts & Loans", icon: CreditCard },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200/60 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200/60">
        <h1 className="text-sidebar-foreground font-semibold tracking-tight">
          FinanceTracker
        </h1>
        <p className="text-sm text-sidebar-foreground/50 mt-0.5">
          AI-Powered Insights
        </p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                activeView === item.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-gray-100 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-gray-100 hover:text-sidebar-foreground transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
