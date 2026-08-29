'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  Clock, PlusCircle, CheckCircle, AlertTriangle, Users,
  Play, DollarSign, Calendar, ChevronRight, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShiftsPage() {
  const {
    currentRole,
    shifts,
    employees,
    openShift,
    approveShift
  } = useApp();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('500');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const activeShift = shifts.find(s => s.status === 'Active');
  const pendingShifts = shifts.filter(s => s.status === 'Pending Review');
  const closedShifts = shifts.filter(s => s.status === 'Closed');

  const handleOpenShiftSubmit = (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      toast.error('Select at least one employee for the shift.');
      return;
    }
    openShift(selectedEmployees, Number(openingCash));
    toast.success('Shift opened successfully.');
    setShowOpenModal(false);
    setSelectedEmployees([]);
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const handleApprove = (shiftId) => {
    approveShift(shiftId);
    toast.success('Shift totals verified and shift is now CLOSED.');
  };

  const selectedShift = shifts.find(s => s.id === selectedShiftId);

  return (
    <AppLayout currentPath="/shifts">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><Clock size={18} /></span>
              Shift Lifecycle Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor daily operations, verify cashier shift reports, and approve cash flows.</p>
          </div>
          {(currentRole === 'owner' || currentRole === 'manager') && !activeShift && (
            <button
              onClick={() => { setOpeningCash('500'); setShowOpenModal(true); }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
            >
              <PlusCircle size={14} /> Open New Shift
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Active Shift Status</h2>
              
              {activeShift ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase text-primary bg-primary/15 border border-primary/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Active Now
                    </span>
                    <p className="font-extrabold text-white text-base">Shift #{activeShift.id.slice(-6)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Started: {activeShift.startTime} · Date: {activeShift.date}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opening Float</span>
                      <span className="font-bold text-white font-mono">{activeShift.openingCash} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Sales</span>
                      <span className="font-bold text-white font-mono">{activeShift.revenue} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses</span>
                      <span className="font-bold text-red-400 font-mono">-{activeShift.expenses} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advances Paid</span>
                      <span className="font-bold text-warning font-mono">-{activeShift.withdrawals} EGP</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <AlertTriangle className="mx-auto mb-2 text-warning" size={24} />
                  No shift is currently active in the lounge.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                Pending Settle Review ({pendingShifts.length})
              </h2>

              <div className="space-y-2">
                {pendingShifts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2 text-center">No shifts awaiting review.</p>
                ) : (
                  pendingShifts.map(s => (
                    <div key={s.id} className="p-4 bg-[#131722] border border-[#1F293D] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">Shift #{s.id.slice(-6)}</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-warning/10 border border-warning/20 text-warning uppercase">Awaiting Settle</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          Date: {s.date} · Cash Expected: {s.closingData?.expectedCash} EGP · Counted: {s.closingData?.actualCash} EGP
                        </p>
                        {s.closingData?.difference !== undefined && (
                          <p className={"text-[10px] font-bold mt-1 " + (s.closingData.difference === 0 ? "text-primary" : "text-red-400")}>
                            Discrepancy: {s.closingData.difference} EGP
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedShiftId(s.id)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg font-bold text-[10px]"
                        >
                          Details
                        </button>
                        {(currentRole === 'owner' || currentRole === 'manager') && (
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-[10px] shadow-[0_0_10px_rgba(0,255,163,0.15)]"
                          >
                            Approve Settle
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Historical Shift Logs</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2 font-bold">Shift ID</th>
                      <th className="py-2 px-2 font-bold">Date</th>
                      <th className="py-2 px-2 font-bold">Opening float</th>
                      <th className="py-2 px-2 font-bold">Revenue</th>
                      <th className="py-2 px-2 font-bold">Approved By</th>
                      <th className="py-2 px-2 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/50 text-slate-300">
                    {closedShifts.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No historical closed shifts found.</td></tr>
                    ) : (
                      closedShifts.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.025]">
                          <td className="py-3 px-2 font-bold text-white">#{s.id.slice(-6)}</td>
                          <td className="py-3 px-2 font-mono text-muted-foreground">{s.date}</td>
                          <td className="py-3 px-2 font-mono">{s.openingCash} EGP</td>
                          <td className="py-3 px-2 font-mono text-primary">+{s.revenue} EGP</td>
                          <td className="py-3 px-2">{s.approvedBy || '--'}</td>
                          <td className="py-3 px-2 text-right">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-slate-700 text-slate-400 bg-slate-800/30">
                              CLOSED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowOpenModal(false)} />
          <form onSubmit={handleOpenShiftSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Open New Shift Float</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Opening Cash Float (EGP)</label>
                <input type="number" className="input-field py-2 w-full" value={openingCash} onChange={e => setOpeningCash(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Assign Staff Members</label>
                <div className="space-y-1 max-h-[160px] overflow-y-auto border border-[#1F293D] rounded-xl p-2 bg-[#131722]">
                  {employees.filter(emp => emp.status === 'Active').map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => handleToggleEmployee(emp.id)}
                      className={"p-2 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors " + (selectedEmployees.includes(emp.id) ? "bg-primary/10 border border-primary/25 text-white" : "text-slate-400 border border-transparent")}
                    >
                      <span className="font-bold text-xs">{emp.name}</span>
                      <span className="text-[10px] opacity-75">{emp.jobTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowOpenModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Open Shift Now</button>
            </div>
          </form>
        </div>
      )}

      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedShiftId(null)} />
          <div className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Shift Settle Audit Detail: #{selectedShift.id.slice(-6)}</h3>
              <button onClick={() => setSelectedShiftId(null)} className="text-muted-foreground hover:text-white"><X size={16} /></button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131722] p-3 rounded-xl border border-[#1F293D]">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Expected Cash</p>
                  <p className="font-black text-white text-sm font-mono mt-0.5">{selectedShift.closingData?.expectedCash} EGP</p>
                </div>
                <div className="bg-[#131722] p-3 rounded-xl border border-[#1F293D]">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Counted Cash</p>
                  <p className="font-black text-white text-sm font-mono mt-0.5">{selectedShift.closingData?.actualCash} EGP</p>
                </div>
              </div>

              {selectedShift.closingData?.explanation && (
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-xl text-warning">
                  <p className="font-bold text-[10px] uppercase">Cashier explanation</p>
                  <p className="mt-0.5 italic text-[11px]">{selectedShift.closingData.explanation}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Inventory Count Audits</p>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {selectedShift.closingData?.inventoryCounts.map(count => (
                    <div key={count.productId} className="flex justify-between items-center p-2 bg-[#131722] rounded-lg">
                      <span className="font-semibold text-white">{count.productId}</span>
                      <span className="font-mono text-[10px] text-slate-300">
                        Expected: {count.expected} · Counted: {count.actual} · <span className={count.diff === 0 ? "text-primary" : "text-red-400 font-bold"}>Diff: {count.diff}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedShiftId(null)} className="btn-secondary px-4 py-2 text-xs">Close Audit Details</button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
