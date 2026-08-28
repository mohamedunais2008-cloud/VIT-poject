import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, DollarSign, Clock, ShieldAlert, Award, FileText, Check } from 'lucide-react';

function SupplierDashboard({ invoices, offers, fetchData }) {
  const [supplierName, setSupplierName] = useState('ABC Manufacturing Ltd');
  const [buyerName, setBuyerName] = useState('Reliance Retail Ltd');
  const [amount, setAmount] = useState('');
  const [dueInDays, setDueInDays] = useState('60');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
  const invoiceOffers = selectedInvoice ? offers.filter(o => o.invoiceId === selectedInvoice.id) : [];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid invoice amount");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName,
          buyerName,
          amount: parseFloat(amount),
          dueInDays: parseInt(dueInDays)
        })
      });

      if (response.ok) {
        const addedInvoice = await response.json();
        setAmount('');
        setSelectedInvoiceId(addedInvoice.id);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get status color helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-semibold">VERIFIED</span>;
      case 'PARTIALLY_VERIFIED':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-semibold">PARTIAL</span>;
      case 'DISPUTED':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold">DISPUTED</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-xs font-semibold">PENDING</span>;
    }
  };

  const getFinancingStatusBadge = (status) => {
    switch (status) {
      case 'FINANCED':
        return <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider animate-pulse">Financed</span>;
      case 'SETTLED':
        return <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Settled</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Market</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Upload Invoice Form */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <UploadCloud className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Present New Invoice</h2>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Supplier Entity</label>
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ABC Manufacturing Ltd">ABC Manufacturing Ltd</option>
              <option value="Spark Components Pvt Ltd">Spark Components Pvt Ltd</option>
              <option value="Nexus Logistics">Nexus Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Buyer (Payer)</label>
            <select
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Reliance Retail Ltd">Reliance Retail Ltd</option>
              <option value="Tata Motors Ltd">Tata Motors Ltd</option>
              <option value="Zomato Ltd">Zomato Ltd</option>
              <option value="Infosys Technologies">Infosys Technologies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Invoice Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Payment Tenor (Days)</label>
            <select
              value={dueInDays}
              onChange={(e) => setDueInDays(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="30">30 Days</option>
              <option value="45">45 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="120">120 Days</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Verifying Trade...' : 'Submit to Capital Market'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* List of Invoices */}
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1.5">Submitted Claims</h3>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedInvoiceId(inv.id)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs flex justify-between items-center transition-all ${
                  (selectedInvoice && selectedInvoice.id === inv.id)
                    ? 'bg-slate-800 border-indigo-600/50 shadow-sm'
                    : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-slate-300 font-semibold">{inv.id}</span>
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{inv.buyerName}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-slate-200 font-bold">₹{(inv.amount / 100000).toFixed(1)}L</span>
                  <div className="flex gap-1 items-center">
                    {getFinancingStatusBadge(inv.status)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Invoice Details, Audit & Risk */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {selectedInvoice ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedInvoice.id}</h2>
                    {getStatusBadge(selectedInvoice.verificationStatus)}
                    {getFinancingStatusBadge(selectedInvoice.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Submitted by <strong className="text-slate-300">{selectedInvoice.supplierName}</strong> matching buyer <strong className="text-slate-300">{selectedInvoice.buyerName}</strong></p>
                </div>
                {selectedInvoice.status === 'FINANCED' && (
                  <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    Waiting for Buyer Repayment
                  </div>
                )}
                {selectedInvoice.status === 'SETTLED' && (
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    Repayment Settled
                  </div>
                )}
              </div>

              {/* Grid: Invoice Properties, Verification Audit, Risk Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Invoice Stats */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrics</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Value</span>
                      <span className="font-mono font-bold text-white">₹{selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Tenor Period</span>
                      <span className="font-mono text-white">{selectedInvoice.tenor} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Due Date</span>
                      <span className="font-mono text-slate-300">{selectedInvoice.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Pipeline */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Audit</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">GST Registration</span>
                      {selectedInvoice.verificationDetails?.gstVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">PO Matching Audit</span>
                      {selectedInvoice.verificationDetails?.poMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Delivery Evidence</span>
                      <span className="text-[10px] text-slate-300 font-mono text-right max-w-[120px] truncate">{selectedInvoice.verificationDetails?.deliveryProof}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Buyer Confirmation</span>
                      {selectedInvoice.verificationDetails?.buyerConfirmed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Engine Assessment */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Risk Score</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-center gap-4">
                    <div className="relative flex items-center justify-center">
                      {/* SVG Gauge */}
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-800 fill-none" strokeWidth="6" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className={`fill-none ${
                            selectedInvoice.riskScore < 30 ? 'stroke-emerald-500' : selectedInvoice.riskScore < 60 ? 'stroke-amber-500' : 'stroke-red-500'
                          }`}
                          strokeWidth="6" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - selectedInvoice.riskScore / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-base font-black text-white font-mono">{selectedInvoice.riskScore}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Index</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="text-[10px]">
                        <span className="text-slate-500 block">Supplier Standing</span>
                        <span className={`font-semibold ${selectedInvoice.supplierRisk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedInvoice.supplierRisk} RISK</span>
                      </div>
                      <div className="text-[10px]">
                        <span className="text-slate-500 block">Buyer Liability</span>
                        <span className={`font-semibold ${selectedInvoice.buyerRisk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedInvoice.buyerRisk} RISK</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Competing Offers & Bid Board */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2"> Funder Competitive Bid Board ({invoiceOffers.length} Bids)</h3>
              
              {invoiceOffers.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No active bids matching this invoice's criteria yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {invoiceOffers.sort((a,b) => b.suitabilityScore - a.suitabilityScore).map((offer) => {
                    const fundedAmount = Math.round(selectedInvoice.amount * (offer.advanceRate / 100));
                    const isAccepted = offer.status === 'ACCEPTED';
                    const isRejected = offer.status === 'REJECTED';
                    const isInvoiceFinanced = selectedInvoice.status !== 'MARKETPLACE';

                    return (
                      <div 
                        key={offer.id} 
                        className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isAccepted 
                            ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                            : isRejected
                            ? 'opacity-40 bg-slate-950/40 border-slate-900'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Funder Name, Type, and Suitability Indicator */}
                        <div className="flex items-center gap-3">
                          {/* Circular Suitability score badge */}
                          <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${
                            offer.suitabilityScore >= 85 ? 'border-emerald-500/60 bg-emerald-500/5' : offer.suitabilityScore >= 70 ? 'border-amber-500/60 bg-amber-500/5' : 'border-red-500/60 bg-red-500/5'
                          }`}>
                            <span className="text-sm font-bold text-white font-mono">{offer.suitabilityScore}</span>
                            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">Fit</span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{offer.providerName}</h4>
                              <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.25 rounded">{offer.providerType}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">Bid ID: <span className="font-mono text-slate-400">{offer.id}</span></p>
                          </div>
                        </div>

                        {/* Bid Specific Terms */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 md:px-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-medium">Interest Rate</span>
                            <span className="text-xs font-bold text-white font-mono">{offer.interestRate}% <span className="text-[9px] text-slate-400 font-normal">p.a.</span></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-medium">Fund Advance</span>
                            <span className="text-xs font-bold text-white font-mono">{offer.advanceRate}% <span className="text-[9px] text-slate-400 font-normal">(₹{fundedAmount.toLocaleString()})</span></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-medium">Processing Fee</span>
                            <span className="text-xs font-bold text-white font-mono">₹{offer.processingFee.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-medium">Settlement Speed</span>
                            <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {offer.settlementSpeedDays === 0.5 ? '12 Hours' : `${offer.settlementSpeedDays} Days`}
                            </span>
                          </div>
                        </div>

                        {/* Drawdown Action button */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isAccepted ? (
                            <div className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Accepted
                            </div>
                          ) : isRejected ? (
                            <span className="text-xs text-slate-600 font-bold uppercase">Declined</span>
                          ) : (
                            <button
                              onClick={() => handleAcceptOffer(offer.id)}
                              disabled={isInvoiceFinanced}
                              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                                isInvoiceFinanced
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:bg-indigo-700 shadow-md shadow-indigo-600/10'
                              }`}
                            >
                              Drawdown
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No invoices submitted yet. Present your first invoice on the left to activate the capital market!</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default SupplierDashboard;
