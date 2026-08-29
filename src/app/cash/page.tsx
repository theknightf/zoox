'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  Wallet, DollarSign, ArrowDownRight, ArrowUpRight, Clock,
  Calendar, Users, AlertTriangle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function CashTreasuryPage() {
  const {
    currentRole,
    cashTransactions,
    cashOnHand,
    recordCashTransaction
  } = useApp();

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualType, setManualType] = useState('In');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDesc, setManualDesc] = useState('');

  const handleManualTxSubmit = (e) => {
    e.preventDefault();
    if (currentRole !== 'owner') {
      toast.error('Only Owner can perform manual cash operations.');
      return;
    }
    const val = Number(manualAmount);
    if (!val || val <= 0) {
      toast.error('Enter a valid cash amount.');
      return;
    }
    if (!manualDesc.trim()) {
      toast.error('Enter transaction description.');
      return;
    }

    recordCashTransaction(
      manualType,
      val,
      'Manual',
      'manual-' + Date.now(),
      manualDesc
    );
    toast.success('Manual cash transaction successfully posted.');
    setShowManualModal(false);
    setManualAmount('');
    setManualDesc('');
  };

  return (
    <AppLayout currentPath="/cash">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><Wallet size={18} /></span>
              Cash &amp; Treasury Drawer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Live tracking of cash float, session billing income, expense payouts, and employee advances.</p>
          </div>
          {currentRole === 'owner' && (
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
            >
              Manual Adjustment
            </button>
          )}
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0B0F19] border border-primary/30 p-5 rounded-2xl space-y-2 shadow-[0_0_20px_rgba(0,255,163,0.05)]">
            <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
              <DollarSign size={12} /> Cash On Hand (Float)
            </span>
            <p className="text-2xl font-black text-white font-mono">{cashOnHand.toLocaleString()} EGP</p>
          </div>
        </div>

        {/* Cash transaction history table */}
        <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden p-5 space-y-4">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Cash Transaction Ledgers</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 font-bold">Time</th>
                  <th className="py-2 px-2 font-bold">Transaction Description</th>
                  <th className="py-2 px-2 font-bold">Category Source</th>
                  <th className="py-2 px-2 font-bold">Amount</th>
                  <th className="py-2 px-2 font-bold text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50 text-slate-300">
                {cashTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No cash transactions logged.</td></tr>
                ) : (
                  cashTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.025]">
                      <td className="py-3 px-2 font-mono text-muted-foreground">{new Date(tx.timestamp).toLocaleString('en-EG', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-white">{tx.description}</p>
                        <span className="text-[9px] text-muted-foreground font-mono">Ref ID: #{tx.referenceId.slice(-6)}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#131722] border border-[#1F293D]">
                          {tx.source}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono">
                        <span className={"font-bold flex items-center gap-0.5 " + (tx.type === 'In' ? 'text-primary' : 'text-red-400')}>
                          {tx.type === 'In' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {tx.type === 'In' ? '+' : '-'}{tx.amount} EGP
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-right text-white font-bold">{tx.runningBalance.toLocaleString()} EGP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Manual Tx Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowManualModal(false)} />
          <form onSubmit={handleManualTxSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Perform Manual Cash Adjustment</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Operation Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('In')}
                    className={"flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all " + (manualType === 'In' ? 'bg-primary/10 border-primary text-primary' : 'border-[#1F293D] text-muted-foreground')}
                  >
                    Cash Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('Out')}
                    className={"flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all " + (manualType === 'Out' ? 'bg-red-500/10 border-red-500 text-red-400' : 'border-[#1F293D] text-muted-foreground')}
                  >
                    Cash Stock Out
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Cash Amount (EGP)</label>
                <input type="number" className="input-field py-2 w-full text-xs" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Description &amp; Reason</label>
                <input type="text" className="input-field py-2 w-full text-xs" placeholder="e.g. Owner injection, minor structural repair" value={manualDesc} onChange={e => setManualDesc(e.target.value)} required />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowManualModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Post Settle</button>
            </div>
          </form>
        </div>
      )}

    </AppLayout>
  );
}
