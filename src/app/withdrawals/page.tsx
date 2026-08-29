'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  ArrowDownCircle, PlusCircle, CheckCircle, XCircle, Clock,
  Calendar, Users, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const {
    currentRole,
    withdrawals,
    requestWithdrawal,
    approveWithdrawal,
    employees
  } = useApp();

  const [showReqModal, setShowReqModal] = useState(false);
  const [reqEmpId, setReqEmpId] = useState('emp-1');
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');

  const handleReqSubmit = (e) => {
    e.preventDefault();
    const val = Number(reqAmount);
    if (!val || val <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (!reqReason.trim()) {
      toast.error('Enter withdrawal reason.');
      return;
    }

    requestWithdrawal(reqEmpId, val, reqReason);
    toast.success('Withdrawal advance requested. Awaiting Manager check.');
    setShowReqModal(false);
    setReqAmount('');
    setReqReason('');
  };

  const handleApprove = (id) => {
    approveWithdrawal(id);
    toast.success('Withdrawal advance approved & cash drawer transaction created.');
  };

  return (
    <AppLayout currentPath="/withdrawals">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><ArrowDownCircle size={18} /></span>
              Cash Advances &amp; Salary Withdrawals
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Record mid-month employee borrowing, advances, and payouts.</p>
          </div>
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
          >
            <PlusCircle size={14} /> Request Cash Advance
          </button>
        </div>

        {/* Withdrawals List */}
        <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden p-5 space-y-4">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Borrowing Settle Queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 font-bold">Details</th>
                  <th className="py-2 px-2 font-bold">Staff Member</th>
                  <th className="py-2 px-2 font-bold">Borrow Amount</th>
                  <th className="py-2 px-2 font-bold">Shift Connection</th>
                  <th className="py-2 px-2 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50 text-slate-300">
                {withdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No salary advance logs found.</td></tr>
                ) : (
                  withdrawals.map(w => {
                    const emp = employees.find(empObj => empObj.id === w.employeeId);
                    return (
                      <tr key={w.id} className="hover:bg-white/[0.025]">
                        <td className="py-3 px-2">
                          <p className="font-bold text-white">{w.reason}</p>
                          <span className="text-[9px] text-muted-foreground font-mono">{w.date} · {w.time}</span>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-300">{emp ? emp.name : 'Unknown Staff'}</td>
                        <td className="py-3 px-2 font-mono font-bold text-red-400">-{w.amount} EGP</td>
                        <td className="py-3 px-2 font-mono text-muted-foreground">Shift #{w.shiftId.slice(-6)}</td>
                        <td className="py-3 px-2 text-right">
                          {w.status === 'Pending' ? (
                            <div className="flex justify-end gap-1.5" onClick={(evt) => evt.stopPropagation()}>
                              {(currentRole === 'owner' || currentRole === 'manager') ? (
                                <button
                                  onClick={() => handleApprove(w.id)}
                                  className="px-2 py-1 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 rounded-lg text-[9px] font-bold"
                                >
                                  Approve &amp; Pay Out
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-warning/20 bg-warning/5 text-warning uppercase">
                                  Pending approval
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={"px-2 py-0.5 rounded text-[9px] font-bold border " + (w.status === 'Approved' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-slate-700 bg-slate-800 text-slate-300') + " uppercase"}>
                              {w.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Request Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowReqModal(false)} />
          <form onSubmit={handleReqSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Request Salary Advance Payout</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Select Borrower Staff</label>
                <select className="input-field py-2 w-full text-xs" value={reqEmpId} onChange={e => setReqEmpId(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Borrowing Amount (EGP)</label>
                <input type="number" className="input-field py-2 w-full text-xs" value={reqAmount} onChange={e => setReqAmount(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Reason &amp; Explanation</label>
                <input type="text" className="input-field py-2 w-full text-xs" placeholder="e.g. Purchase medications, personal emergency" value={reqReason} onChange={e => setReqReason(e.target.value)} required />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowReqModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Post Request</button>
            </div>
          </form>
        </div>
      )}

    </AppLayout>
  );
}
