import React, { useState } from 'react';
import { Terminal, Shield, RefreshCw, BarChart2, ShieldCheck, Scale, Cpu, Network, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard({ invoices, providers, offers, logs, fetchData }) {
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isSolving, setIsSolving] = useState(false);

  // Compute global summary metrics
  const totalVolume = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  const financedInvs = invoices.filter(inv => inv.status === 'FINANCED' || inv.status === 'SETTLED');
  const totalFundedVolume = financedInvs.reduce((sum, inv) => {
    // Find accepted offer to calculate exact funded amount (advance rate)
    const offer = offers.find(o => o.invoiceId === inv.id && o.status === 'ACCEPTED');
    const rate = offer ? offer.advanceRate / 100 : 0.90; // Fallback to 90%
    return sum + (inv.amount * rate);
  }, 0);

  const activeFundedVolume = invoices.filter(inv => inv.status === 'FINANCED').reduce((sum, inv) => {
    const offer = offers.find(o => o.invoiceId === inv.id && o.status === 'ACCEPTED');
    const rate = offer ? offer.advanceRate / 100 : 0.90;
    return sum + (inv.amount * rate);
  }, 0);

  const avgRiskScore = invoices.length > 0 
    ? Math.round(invoices.reduce((sum, inv) => sum + inv.riskScore, 0) / invoices.length)
    : 0;

  // Prepare chart data for Recharts: Liquidity Deployed vs Free per Provider
  const chartData = providers.map(p => ({
    name: p.type === 'Bank' ? 'BoB Bank' : p.type === 'NBFC' ? 'Groww NBFC' : p.type === 'Fund' ? 'KredX Fund' : 'Falcon Fin',
    'Capital Deployed': p.allocatedCapital,
    'Free Liquidity': p.liquidity - p.allocatedCapital
  }));

  const handleRunOptimizer = async () => {
    setIsSolving(true);
    try {
      const response = await fetch('/api/optimize');
      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Claims Value</span>
          <h3 className="text-xl font-bold font-mono text-white mt-1">₹{(totalVolume/100000).toFixed(1)}L</h3>
          <p className="text-[10px] text-slate-400 mt-1">Across {invoices.length} submitted invoices</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Capital Allocated (Total)</span>
          <h3 className="text-xl font-bold font-mono text-white mt-1">₹{(totalFundedVolume/100000).toFixed(1)}L</h3>
          <p className="text-[10px] text-slate-400 mt-1">Active deployment + settled assets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Deployed Liquidity</span>
          <h3 className="text-xl font-bold font-mono text-indigo-400 mt-1">₹{(activeFundedVolume/100000).toFixed(1)}L</h3>
          <p className="text-[10px] text-slate-400 mt-1">Outstanding active credit assets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Marketplace Risk</span>
          <h3 className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-1">
            {avgRiskScore}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Weighted transaction risk index</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Charts and Liquidity Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Capital Distribution Graph</h2>
            </div>
            <button 
              onClick={fetchData}
              className="p-1 hover:bg-slate-800 active:bg-slate-950 rounded transition-all text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart */}
          <div className="h-[220px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Capital Deployed" stackId="a" fill="#4f46e5" />
                <Bar dataKey="Free Liquidity" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Live Log Terminal (Agentic Loop Monitoring) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[300px]">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Agentic Execution Stream</h2>
          </div>
          
          <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="text-indigo-400 font-semibold">{log.action}:</span>{' '}
                <span className="text-slate-300">{log.details}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Capital Allocation Solver Simulator Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Capital Allocation Optimization Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates a capital-constrained supply chain to optimize fund matching across multiple invoices, contrasting greedy interest-rate sorting with our multi-factor suitability algorithm.
            </p>
          </div>
          <button
            onClick={handleRunOptimizer}
            disabled={isSolving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4 animate-spin" style={{ animationDuration: isSolving ? '2s' : '0s' }} />
            {isSolving ? 'Solving MIP Models...' : 'Run Optimization Scenario'}
          </button>
        </div>

        {optimizationResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            
            {/* Greedy rate model */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Greedy Bilateral Model (Rate-Only)</h4>
                <span className="bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Standard</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Capital Deployed</span>
                  <span className="font-mono text-white font-bold">₹{optimizationResult.greedy.totalFunded.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Average Suitability</span>
                  <span className="font-mono text-slate-200 font-bold">{optimizationResult.greedy.averageSuitability}/100</span>
                </div>
              </div>
              
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Model Allocations</span>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {optimizationResult.greedy.allocations.map((alloc, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 rounded p-2 text-[10px] flex justify-between items-center font-mono">
                      <div>
                        <span className="text-indigo-400 font-bold">{alloc.invoiceId}</span> &rarr; <span className="text-slate-300">{alloc.providerName.split(' ')[0]}</span>
                      </div>
                      <div className="text-slate-400">
                        {alloc.interestRate}% rate | ₹{(alloc.allocatedAmount/100000).toFixed(1)}L
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intelligent Suitability Model */}
            <div className="bg-slate-950 border border-indigo-900/30 rounded-xl p-4.5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-indigo-900/30 pb-2.5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-indigo-400" />
                  Multi-Factor Suitability Optimizer
                </h4>
                <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Optimized</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-indigo-400 block font-medium">Total Capital Deployed</span>
                  <span className="font-mono text-white font-bold">₹{optimizationResult.optimized.totalFunded.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-indigo-400 block font-medium">Average Suitability Boost</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    {optimizationResult.optimized.averageSuitability}/100 
                    <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 rounded">
                      +{Math.round(((optimizationResult.optimized.averageSuitability - optimizationResult.greedy.averageSuitability) / (optimizationResult.greedy.averageSuitability || 1)) * 100)}%
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-[10px] text-indigo-400 uppercase tracking-wide font-medium">Model Allocations</span>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {optimizationResult.optimized.allocations.map((alloc, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 rounded p-2 text-[10px] flex justify-between items-center font-mono">
                      <div>
                        <span className="text-emerald-400 font-bold">{alloc.invoiceId}</span> &rarr; <span className="text-slate-300">{alloc.providerName.split(' ')[0]}</span>
                      </div>
                      <div className="text-slate-300">
                        {alloc.interestRate}% rate | Suit: {alloc.suitabilityScore} | ₹{(alloc.allocatedAmount/100000).toFixed(1)}L
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 bg-slate-950 border border-slate-850 rounded-xl">
            <Cpu className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Run the sandbox simulation above to contrast Greedy Rate Selection with Multi-Factor Optimization.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;
