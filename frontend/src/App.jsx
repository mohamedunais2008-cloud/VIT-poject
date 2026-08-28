import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import SupplierDashboard from './components/SupplierDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import AdminDashboard from './components/AdminDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import { Terminal, Landmark, ShieldCheck, Activity, Award, LogOut, Building2 } from 'lucide-react';

function App() {
  // 'landing' -> 'auth' -> 'dashboard'
  const [appState, setAppState] = useState('landing'); 
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'supplier', 'buyer', 'provider', 'admin'
  
  const [invoices, setInvoices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Poll state from API every 2.5 seconds to make the UI dynamically responsive
  const fetchData = async () => {
    try {
      const [resInvs, resProvs, resOffers, resLogs] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/providers'),
        fetch('/api/offers'),
        fetch('/api/logs')
      ]);

      if (resInvs.ok && resProvs.ok && resOffers.ok && resLogs.ok) {
        const [invsData, provsData, offersData, logsData] = await Promise.all([
          resInvs.json(),
          resProvs.json(),
          resOffers.json(),
          resLogs.json()
        ]);
        setInvoices(invsData);
        setProviders(provsData);
        setOffers(offersData);
        setLogs(logsData);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Failed to connect to backend api:", err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  const getRoleTitle = (role) => {
    switch (role) {
      case 'supplier': return 'Supplier Portal';
      case 'buyer': return 'Corporate Buyer';
      case 'provider': return 'Funder Workspace';
      case 'admin': return 'Admin Control Room';
      default: return '';
    }
  };
  
  const getRoleIcon = (role) => {
    switch (role) {
      case 'supplier': return <ShieldCheck className="w-4 h-4" />;
      case 'buyer': return <Building2 className="w-4 h-4" />;
      case 'provider': return <Landmark className="w-4 h-4" />;
      case 'admin': return <Terminal className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleLogin = (role) => {
    setCurrentUserRole(role);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setAppState('auth');
  };

  // 1. Landing Page State
  if (appState === 'landing') {
    return <LandingPage onEnter={() => setAppState('auth')} />;
  }

  // 2. Auth Screen State
  if (appState === 'auth') {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 3. Dashboard State
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Dynamic Activity Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">CSI ORIGIN Hackathon - Team Entry</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Agentic Matching Loop: <strong className="text-emerald-400">Active</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span>Backend Server: {isConnected ? <span className="text-emerald-400">Connected</span> : <span className="text-red-400">Offline</span>}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-slate-900/60 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30">
            <Landmark className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Vectis <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-indigo-400 border border-slate-700 font-mono">Agentic Capital</span>
            </h1>
            <p className="text-xs text-slate-400">Intelligent Working Capital Financing Market</p>
          </div>
        </div>

        {/* Current Role Indicator & Logout */}
        {currentUserRole && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 rounded-lg text-indigo-300 text-sm font-semibold shadow-[0_0_15px_rgba(79,70,229,0.15)]">
              {getRoleIcon(currentUserRole)}
              {getRoleTitle(currentUserRole)}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Log Activity Ticker */}
      {logs.length > 0 && currentUserRole === 'admin' && (
        <div className="bg-slate-950 border-b border-slate-900 px-6 py-2 flex items-center gap-3 text-xs overflow-hidden">
          <div className="flex items-center gap-1.5 text-indigo-400 shrink-0 font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            System Live:
          </div>
          <div className="text-slate-300 font-mono truncate animate-fade-in flex-1">
            [{new Date(logs[0].timestamp).toLocaleTimeString()}] <span className="text-indigo-300">{logs[0].action}</span> &rarr; {logs[0].details}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="p-4 bg-slate-900 rounded-full border border-slate-800 text-slate-500 animate-pulse">
              <Landmark className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-white">Connecting to Agentic Backend...</h3>
            <p className="text-slate-400 text-xs max-w-md">
              Please make sure your Node.js API server is running on port 5000. Start it by running <code className="bg-slate-900 px-2 py-1 rounded text-red-400 text-xs">npm run dev</code> at the root.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in h-full">
            {currentUserRole === 'supplier' && (
              <SupplierDashboard invoices={invoices} offers={offers} fetchData={fetchData} />
            )}
            {currentUserRole === 'buyer' && (
              <BuyerDashboard invoices={invoices} fetchData={fetchData} />
            )}
            {currentUserRole === 'provider' && (
              <ProviderDashboard invoices={invoices} providers={providers} offers={offers} fetchData={fetchData} />
            )}
            {currentUserRole === 'admin' && (
              <AdminDashboard invoices={invoices} providers={providers} offers={offers} logs={logs} fetchData={fetchData} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>&copy; 2026 Vectis Capital Market. CSI ORIGIN Hackathon - Built with Google Antigravity.</p>
      </footer>
    </div>
  );
}

export default App;
