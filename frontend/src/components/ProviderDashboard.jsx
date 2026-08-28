import React, { useState } from 'react';
import { Landmark, Settings2, Sliders, ShieldCheck, PlayCircle, PlusCircle, AlertCircle, ArrowUpRight, DollarSign, Activity, FileSpreadsheet } from 'lucide-react';

function ProviderDashboard({ invoices, providers, offers, fetchData }) {
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id || 'PROV-001');
  const [interestRate, setInterestRate] = useState('11.5');
  const [advanceRate, setAdvanceRate] = useState('90');
  const [processingFee, setProcessingFee] = useState('5000');
  const [biddingInvoiceId, setBiddingInvoiceId] = useState('');
  
  // States for Auto-bid rule parameters
  const [autoBidEnabled, setAutoBidEnabled] = useState(true);
  const [maxRiskScore, setMaxRiskScore] = useState(40);
  const [maxBidAmount, setMaxBidAmount] = useState(1000000);

  const selectedProvider = providers.find(p => p.id === selectedProviderId) || providers[0];

  // Sync state when provider changes
  React.useEffect(() => {
    if (selectedProvider) {
      setAutoBidEnabled(selectedProvider.autoBidRules.enabled);
      setMaxRiskScore(selectedProvider.autoBidRules.maxRiskScore);
      setMaxBidAmount(selectedProvider.autoBidRules.maxAmount);
    }
  }, [selectedProviderId, providers]);

  if (!selectedProvider) return null;

  // Active Portfolio (Invoices financed by this provider)
  const myOffers = offers.filter(o => o.providerId === selectedProvider.id);
  const activeOffers = myOffers.filter(o => o.status === 'ACCEPTED');
  
  const myFundedInvoices = invoices.filter(inv => 
    activeOffers.some(o => o.invoiceId === inv.id)
  );

  // Filter invoices on market compatible with provider risk appetite and max limits
  const marketInvoices = invoices.filter(inv => {
    // Only show unfinanced invoices
    if (inv.status !== 'MARKETPLACE') return false;

    // Check size limit
    if (inv.amount > selectedProvider.maxInvoiceSize) return false;

    // Check tenor limits
    if (inv.tenor < selectedProvider.minTenor || inv.tenor > selectedProvider.maxTenor) return false;

    // Check general compatibility
    if (selectedProvider.riskAppetite === 'LOW' && inv.riskScore > 35) return false;
    if (selectedProvider.riskAppetite === 'MEDIUM' && inv.riskScore > 65) return false;

    return true;
  });

  const handleUpdateRules = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/providers/${selectedProvider.id}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: autoBidEnabled,
          maxRiskScore: parseInt(maxRiskScore),
          maxAmount: parseFloat(maxBidAmount)
        })
      });

      if (response.ok) {
        alert(`Auto-bid rules successfully updated for ${selectedProvider.name}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualBid = async (e) => {
    e.preventDefault();
    if (!biddingInvoiceId) return alert("Select an invoice to bid on");
    if (parseFloat(interestRate) <= 0 || parseInt(advanceRate) <= 0 || parseFloat(processingFee) < 0) {
      return alert("Please enter valid bid parameters");
    }

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: biddingInvoiceId,
          providerId: selectedProvider.id,
          interestRate: parseFloat(interestRate),
          advanceRate: parseInt(advanceRate),
          processingFee: parseFloat(processingFee)
        })
      });

      if (response.ok) {
        alert("Manual bid successfully submitted to the marketplace!");
        setBiddingInvoiceId('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (appetite) => {
    switch (appetite) {
      case 'LOW': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'MEDIUM': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'HIGH': return 'text-red-400 border-red-500/20 bg-red-500/5';
      default: return 'text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Selector and Auto-bid Rules */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Selector card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Landmark className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-bold">Funder Identity</h2>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Select Funder Entity</label>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>

          {/* Allocation stats */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Total Liquidity Pool</span>
              <span className="font-mono text-white font-bold">₹{selectedProvider.liquidity.toLocaleString()}</span>
            </div>
            
            {/* Funder profile parameters */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className={`p-2.5 rounded-lg border text-center ${getRiskColor(selectedProvider.riskAppetite)}`}>
                <span className="text-[9px] uppercase text-slate-500 block font-medium">Risk Appetite</span>
                <span className="text-xs font-bold font-mono">{selectedProvider.riskAppetite}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-center">
                <span className="text-[9px] uppercase text-slate-500 block font-medium">Max Invoice Size</span>
                <span className="text-xs font-bold text-white font-mono">₹{(selectedProvider.maxInvoiceSize/100000).toFixed(0)}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Bid Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Auto-Bid Engine</h2>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${autoBidEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
          </div>

          <form onSubmit={handleUpdateRules} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-medium">Enable Intelligent Auto-Bidding</label>
              <input
                type="checkbox"
                checked={autoBidEnabled}
                onChange={(e) => setAutoBidEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400 font-medium">Maximum Permissible Risk Score</label>
                <span className="text-xs font-mono font-bold text-indigo-400">{maxRiskScore}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={maxRiskScore}
                onChange={(e) => setMaxRiskScore(e.target.value)}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Maximum Capital Exposure per Claim</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                <input
                  type="number"
                  value={maxBidAmount}
                  onChange={(e) => setMaxBidAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              Commit Policy Rules
            </button>
          </form>
        </div>

      </div>

      {/* 2. Active Portfolio Tracker */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Active funded deals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
            Active Financed Portfolio ({myFundedInvoices.length} Invoices)
          </h3>

          {myFundedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">You haven't financed any invoices yet. Place a bid below to begin deploying capital.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myFundedInvoices.map((inv) => {
                const myAcceptedOffer = offers.find(o => o.invoiceId === inv.id && o.providerId === selectedProvider.id && o.status === 'ACCEPTED');
                if (!myAcceptedOffer) return null;
                const capitalDeployed = Math.round(inv.amount * (myAcceptedOffer.advanceRate / 100));

                return (
                  <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{inv.id}</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.25 rounded font-medium">Financed</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Supplier: <strong className="text-slate-400">{inv.supplierName}</strong> &rarr; Buyer: <strong className="text-slate-400">{inv.buyerName}</strong></p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 flex-1 md:justify-items-center">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-medium">Capital Deployed</span>
                        <span className="font-mono text-slate-200 font-bold">₹{capitalDeployed.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-medium">Yield Rate</span>
                        <span className="font-mono text-slate-200 font-bold">{myAcceptedOffer.interestRate}% p.a.</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-medium">Repayment Tenor</span>
                        <span className="font-mono text-slate-200 font-bold">{inv.tenor} Days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Marketplace Feed & Manual Bidding */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Available Marketplace Feed</h3>
          
          {marketInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No compatible invoices available for bidding. Check supplier portal to add more.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Invoices List */}
              <div className="flex flex-col gap-3">
                {marketInvoices.map((inv) => {
                  const alreadyBid = offers.some(o => o.invoiceId === inv.id && o.providerId === selectedProvider.id);
                  const isBiddingThis = biddingInvoiceId === inv.id;

                  return (
                    <div 
                      key={inv.id} 
                      className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isBiddingThis 
                          ? 'border-indigo-600 bg-slate-950' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold">{inv.id}</span>
                          <span className={`text-[9px] px-2 py-0.25 rounded font-semibold ${
                            inv.riskScore < 30 ? 'bg-emerald-500/10 text-emerald-400' : inv.riskScore < 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                          }`}>Risk Score: {inv.riskScore}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.25 rounded">{inv.verificationStatus}</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 mt-1.5">Supplier: <strong className="text-slate-400">{inv.supplierName}</strong></p>
                        <p className="text-[10px] text-slate-500">Buyer Entity: <strong className="text-slate-400">{inv.buyerName}</strong></p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:flex md:gap-8 text-xs md:justify-items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-medium">Invoice Value</span>
                          <span className="font-mono text-slate-200 font-bold">₹{inv.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-medium">Repayment Tenor</span>
                          <span className="font-mono text-slate-200 font-bold">{inv.tenor} Days</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        {alreadyBid ? (
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Bid Submitted</span>
                        ) : (
                          <button
                            onClick={() => {
                              setBiddingInvoiceId(inv.id);
                              // Auto populate terms with smart estimates
                              const riskRatio = inv.riskScore / 100;
                              const estRate = selectedProvider.targetRateRange.min + (riskRatio * (selectedProvider.targetRateRange.max - selectedProvider.targetRateRange.min));
                              setInterestRate(estRate.toFixed(2));
                              setAdvanceRate(Math.max(80, Math.min(95, Math.round(95 - inv.riskScore / 5))));
                              setProcessingFee(Math.round(inv.amount * selectedProvider.processingFeeRate).toString());
                            }}
                            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                              isBiddingThis 
                                ? 'bg-indigo-600 text-white cursor-default' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:bg-slate-900 border border-slate-700'
                            }`}
                          >
                            Configure Bid
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bid configuration panel */}
              {biddingInvoiceId && (
                <div className="bg-slate-950 border border-indigo-600/30 rounded-xl p-4 animate-slide-down">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-indigo-500" />
                    Place Bid Offer for {biddingInvoiceId}
                  </h4>
                  
                  <form onSubmit={handleManualBid} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1.5 font-medium">Interest Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1.5 font-medium">Advance Rate (%)</label>
                      <input
                        type="number"
                        min="50"
                        max="98"
                        value={advanceRate}
                        onChange={(e) => setAdvanceRate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1.5 font-medium">Processing Fee (INR)</label>
                      <input
                        type="number"
                        value={processingFee}
                        onChange={(e) => setProcessingFee(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Place Bid
                      </button>
                      <button
                        type="button"
                        onClick={() => setBiddingInvoiceId('')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg px-3 py-2 text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default ProviderDashboard;
