import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Building2, Landmark, Terminal, Loader2 } from 'lucide-react';

function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsAuthenticating(true);
    // Simulate network delay
    setTimeout(() => {
      // Determine role by email pattern for realism
      let role = 'supplier';
      if (email.includes('buyer')) role = 'buyer';
      if (email.includes('bank') || email.includes('fund')) role = 'provider';
      if (email.includes('admin')) role = 'admin';
      
      onLogin(role);
    }, 1200);
  };

  const handleDemoLogin = (role, demoEmail) => {
    setEmail(demoEmail);
    setPassword('********');
    setIsAuthenticating(true);
    
    // Simulate secure hand-shake delay
    setTimeout(() => {
      onLogin(role);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-float-delayed"></div>
      </div>

      <div className="glass w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 animate-fade-in border border-slate-800">
        
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Platform Access</h2>
            <p className="text-slate-400 text-sm">Sign in to your Vectis identity to continue.</p>
          </div>

          <form onSubmit={handleManualLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                  placeholder="Enter your corporate email"
                  required
                  disabled={isAuthenticating}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Security Token / Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  required
                  disabled={isAuthenticating}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-3.5 font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-70"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Secure Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side - Quick Demo Access */}
        <div className="w-full md:w-1/2 bg-slate-900/80 p-10 md:p-12 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-center relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-800 pb-3">Judge / Demo Quick Access</h3>
            <p className="text-xs text-slate-500 mb-6">Select a persona below to auto-fill credentials and log in instantly for the hackathon demonstration.</p>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleDemoLogin('supplier', 'treasury@abcmfg.com')}
                disabled={isAuthenticating}
                className="group bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-emerald-500/5 text-left disabled:opacity-50"
              >
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Supplier (MSME)</h4>
                  <p className="text-[10px] text-slate-500 font-mono">treasury@abcmfg.com</p>
                </div>
              </button>

              <button 
                onClick={() => handleDemoLogin('buyer', 'finance@relianceretail.com')}
                disabled={isAuthenticating}
                className="group bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-blue-500/5 text-left disabled:opacity-50"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Corporate Buyer</h4>
                  <p className="text-[10px] text-slate-500 font-mono">finance@relianceretail.com</p>
                </div>
              </button>

              <button 
                onClick={() => handleDemoLogin('provider', 'api@bankofbaroda.com')}
                disabled={isAuthenticating}
                className="group bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-amber-500/5 text-left disabled:opacity-50"
              >
                <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Capital Provider</h4>
                  <p className="text-[10px] text-slate-500 font-mono">api@bankofbaroda.com</p>
                </div>
              </button>

              <button 
                onClick={() => handleDemoLogin('admin', 'system@vectis.com')}
                disabled={isAuthenticating}
                className="group bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-indigo-500/5 text-left disabled:opacity-50"
              >
                <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Platform Admin</h4>
                  <p className="text-[10px] text-slate-500 font-mono">system@vectis.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthScreen;
