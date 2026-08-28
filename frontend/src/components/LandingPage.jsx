import React from 'react';
import { Network, ShieldCheck, ArrowRight, Zap, TrendingUp, Globe2 } from 'lucide-react';

function LandingPage({ onEnter }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] animate-float-delayed"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYuNUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPgo8cGF0aCBkPSJNMCAwdjQwaC41VjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+Cjwvc3ZnPg==')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center px-6 max-w-5xl">
        
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Network className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm">CSI Origin 2026</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Intelligent Capital <br/>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text animate-gradient-x">
            Flows Agentically.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Vectis is a dynamic, multi-agent supply chain financing marketplace. We connect verified MSME invoices with global capital through mathematical suitability routing.
        </p>

        <button 
          onClick={onEnter}
          className="group relative px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg tracking-wide overflow-hidden transition-all hover:scale-105 animate-pulse-glow flex items-center gap-3"
        >
          <span className="relative z-10 flex items-center gap-2">
            Enter Platform Portals <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="glass rounded-2xl p-6 text-left flex flex-col gap-3 transform transition duration-500 hover:-translate-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-white font-bold text-lg">Agentic Verification</h3>
            <p className="text-sm text-slate-400">Automated PO matching, GST audits, and buyer digital confirmation loops.</p>
          </div>
          <div className="glass rounded-2xl p-6 text-left flex flex-col gap-3 transform transition duration-500 hover:-translate-y-2 delay-100">
            <Zap className="w-6 h-6 text-amber-400" />
            <h3 className="text-white font-bold text-lg">Smart Auto-Bidding</h3>
            <p className="text-sm text-slate-400">Capital providers deploy liquidity instantly based on AI risk-appetite parameters.</p>
          </div>
          <div className="glass rounded-2xl p-6 text-left flex flex-col gap-3 transform transition duration-500 hover:-translate-y-2 delay-200">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-white font-bold text-lg">MIP Capital Allocation</h3>
            <p className="text-sm text-slate-400">Mathematical solvers maximize overall supply chain suitability and liquidity distribution.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingPage;
