import React from 'react';
import { ShieldCheck, Building2, Landmark, Terminal, ArrowRight } from 'lucide-react';

function LoginScreen({ onLogin }) {
  const personas = [
    {
      id: 'supplier',
      title: 'Supplier (MSME)',
      description: 'Upload invoices and seek competitive working capital financing.',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      color: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'buyer',
      title: 'Corporate Buyer',
      description: 'Confirm invoices and settle repayments on maturity.',
      icon: <Building2 className="w-8 h-8 text-blue-400" />,
      color: 'hover:border-blue-500 hover:shadow-blue-500/20',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'provider',
      title: 'Financier (Bank)',
      description: 'Deploy capital, set auto-bid rules, and manage portfolio risk.',
      icon: <Landmark className="w-8 h-8 text-amber-400" />,
      color: 'hover:border-amber-500 hover:shadow-amber-500/20',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      description: 'Monitor agentic loop and run capital allocation simulations.',
      icon: <Terminal className="w-8 h-8 text-indigo-400" />,
      color: 'hover:border-indigo-500 hover:shadow-indigo-500/20',
      bg: 'bg-indigo-500/10'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Welcome to Vectis Capital</h1>
        <p className="text-slate-400 max-w-lg mx-auto">Select your persona to access the intelligent supply chain working capital marketplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onLogin(persona.id)}
            className={`group bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg ${persona.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${persona.bg}`}>
                {persona.icon}
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{persona.title}</h3>
            <p className="text-sm text-slate-400">{persona.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LoginScreen;
