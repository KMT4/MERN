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
  Wallet,
  X,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({
  activeView,
  setActiveView,
  onLogout,
  isOpen = false,
  onClose,
}: SidebarProps) {
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

  const renderSidebar = () => (
    <aside className="flex h-full w-[18rem] max-w-[86vw] shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl lg:h-screen lg:w-72 lg:shadow-none">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Wallet className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
              FinanceTracker
            </h1>
            <p className="mt-0.5 truncate text-xs text-sidebar-foreground/55">
              Financial workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/45">
          Overview
        </p>
        <p className="mt-1 text-sm font-medium text-sidebar-foreground">
          Personal finance
        </p>
      </div>

      <nav className="scrollbar-hide flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "group relative flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-medium outline-none transition-all",
                "focus-visible:ring-2 focus-visible:ring-primary/30",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                  : "text-sidebar-foreground/68 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}

              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/48 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <button
          onClick={() => {
            onClose?.();
            onLogout();
          }}
          className="group flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-sidebar-foreground/70 outline-none transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors group-hover:bg-red-500/10 group-hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{renderSidebar()}</div>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute inset-0 h-full w-full bg-black/45 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation"
        />
        <div
          className={cn(
            "relative h-full transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {renderSidebar()}
        </div>
      </div>
    </>
  );
}
