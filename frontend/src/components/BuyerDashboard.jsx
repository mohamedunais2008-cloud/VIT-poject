import React, { useState } from 'react';
import { Building2, CheckCircle2, DollarSign, Clock, ShieldAlert, Check } from 'lucide-react';

function BuyerDashboard({ invoices, fetchData }) {
  const [buyerIdentity, setBuyerIdentity] = useState('Reliance Retail Ltd');
  
  // Filter invoices for the logged-in buyer
  const myInvoices = invoices.filter(inv => inv.buyerName === buyerIdentity);
  
  const pendingConfirmation = myInvoices.filter(inv => !inv.verificationDetails?.buyerConfirmed);
  const activeFinanced = myInvoices.filter(inv => inv.status === 'FINANCED');
  const settled = myInvoices.filter(inv => inv.status === 'SETTLED');

  const handleConfirm = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/confirm`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettle = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/settle`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Identity Selector (for hackathon demo flexibility) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-white font-bold">Buyer Identity</h2>
            <p className="text-xs text-slate-400">Viewing payables for {buyerIdentity}</p>
          </div>
        </div>
        <div>
          <select
            value={buyerIdentity}
            onChange={(e) => setBuyerIdentity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Reliance Retail Ltd">Reliance Retail Ltd</option>
            <option value="Tata Motors Ltd">Tata Motors Ltd</option>
            <option value="Zomato Ltd">Zomato Ltd</option>
            <option value="Infosys Technologies">Infosys Technologies</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Confirmations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
            Pending Liability Confirmations ({pendingConfirmation.length})
          </h3>
          
          {pendingConfirmation.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
              <p className="text-xs text-slate-500">All invoices have been confirmed.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingConfirmation.map(inv => (
                <div key={inv.id} className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-white font-bold">{inv.id}</span>
                      <p className="text-xs text-slate-400 mt-0.5">Supplier: {inv.supplierName}</p>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">₹{inv.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due in {inv.tenor} days
                    </span>
                    <button
                      onClick={() => handleConfirm(inv.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Confirm Liability
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repayment Settlement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
            Active Financed Payables ({activeFinanced.length})
          </h3>

          {activeFinanced.length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No active financed invoices pending settlement.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeFinanced.map(inv => (
                <div key={inv.id} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-white font-bold">{inv.id}</span>
                      <p className="text-xs text-slate-400 mt-0.5">Supplier: {inv.supplierName}</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">₹{inv.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Repayment due: {inv.dueDate}
                    </span>
                    <button
                      onClick={() => handleSettle(inv.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Settle Repayment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {settled.length > 0 && (
             <div className="mt-6 pt-4 border-t border-slate-800">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recently Settled</h4>
               <div className="flex flex-col gap-2 opacity-60">
                 {settled.map(inv => (
                   <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center">
                     <span className="font-mono text-xs text-slate-300">{inv.id}</span>
                     <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 rounded">Paid</span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BuyerDashboard;
