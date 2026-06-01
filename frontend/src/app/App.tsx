import { useState, useEffect } from 'react';
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
    <div className="size-full flex bg-background">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}