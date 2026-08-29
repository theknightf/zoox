'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  ClipboardCheck, ChevronRight, ChevronLeft, DollarSign,
  Package, Gamepad2, ScrollText, AlertOctagon, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ShiftClosingPage() {
  const router = useRouter();
  const {
    currentRole,
    shifts,
    products,
    controllers,
    closeShift
  } = useApp();

  const activeShift = shifts.find(s => s.status === 'Active');
  const [step, setStep] = useState(1);

  // Step 1: Cash State
  const [actualCash, setActualCash] = useState('');
  const [cashExplanation, setCashExplanation] = useState('');

  // Step 2: Inventory State
  const [invCounts, setInvCounts] = useState(() => {
    return products.reduce((acc, p) => {
      acc[p.id] = String(p.stock); // default counted to expected
      return acc;
    }, {});
  });

  // Step 3: Hardware State
  const [hwConfirmed, setHwConfirmed] = useState(false);

  // Step 5: Issue Logger
  const [closingNotes, setClosingNotes] = useState('');

  if (!activeShift) {
    return (
      <AppLayout currentPath="/shift-closing">
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <AlertOctagon size={48} className="mx-auto text-warning" />
          <h2 className="text-lg font-bold text-white">No Active Shift to Settle</h2>
          <p className="text-xs text-muted-foreground">There is currently no active shift logged in this lounge branch. Shifts must be opened by a manager first.</p>
          <button onClick={() => router.push('/shifts')} className="btn-primary w-full py-2.5 text-xs">Go to Shifts</button>
        </div>
      </AppLayout>
    );
  }

  // Cash Calculations
  const openingCash = activeShift.openingCash;
  const cashSales = activeShift.revenue; // Simplify assuming revenue is cash
  const otherIncome = 0;
  const expensesPaid = activeShift.expenses;
  const withdrawalsPaid = activeShift.withdrawals;
  const expectedCash = openingCash + cashSales + otherIncome - expensesPaid - withdrawalsPaid;
  const cashDiff = actualCash === '' ? 0 : Number(actualCash) - expectedCash;

  const handleInvCountChange = (productId, val) => {
    setInvCounts(prev => ({ ...prev, [productId]: val }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (actualCash === '') {
        toast.error('Count the drawer cash and input the actual amount.');
        return;
      }
      if (cashDiff !== 0 && !cashExplanation.trim()) {
        toast.error('Discrepancy detected. Explain cash difference to proceed.');
        return;
      }
    }
    if (step === 2) {
      // Validate all inputs are positive numbers
      const isInvalid = Object.values(invCounts).some(v => isNaN(Number(v)) || Number(v) < 0);
      if (isInvalid) {
        toast.error('Input valid counted stock quantities.');
        return;
      }
    }
    if (step === 3 && !hwConfirmed) {
      toast.error('Verify Playstation consoles & gamepad controller status checkboxes.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Compile Inventory closing counts
    const counts = products.map(p => {
      const actual = Number(invCounts[p.id] || 0);
      return {
        productId: p.name,
        expected: p.stock,
        actual,
        diff: actual - p.stock
      };
    });

    closeShift(activeShift.id, {
      openingCash,
      cashSales,
      otherIncome,
      expensesPaid,
      withdrawalsPaid,
      expectedCash,
      actualCash: Number(actualCash),
      difference: cashDiff,
      explanation: cashExplanation,
      inventoryCounts: counts,
      hardwareStatusConfirmed: hwConfirmed,
      notes: closingNotes
    });

    toast.success('Shift closing submitted to management review queue.');
    router.push('/shifts');
  };

  return (
    <AppLayout currentPath="/shift-closing">
      <div className="p-4 lg:p-6 xl:p-8 max-w-2xl mx-auto space-y-6">

        {/* Wizard Header */}
        <div className="flex justify-between items-center bg-[#0B0F19] border border-[#1F293D] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><ClipboardCheck size={18} /></span>
            <div>
              <h1 className="text-sm font-black text-white">Shift Settle Closing Wizard</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Shift #{activeShift.id.slice(-6)} · 6 Steps</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-primary">Step {step} / 6</span>
        </div>

        {/* Step Indicator dots */}
        <div className="flex justify-between px-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={"h-1 flex-1 mx-0.5 rounded-full transition-all " + (step >= i ? "bg-primary" : "bg-[#1F293D]")} />
          ))}
        </div>

        {/* Wizard Cards */}
        <div className="bg-[#0B0F19] border border-[#1F293D] p-6 rounded-2xl min-h-[300px] flex flex-col justify-between space-y-6">

          {/* STEP 1: CASH */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={15} className="text-primary" /> Step 1: Cash Reconciliation</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#131722] p-3 rounded-xl border border-[#1F293D]">
                  <span className="text-muted-foreground text-[10px]">Expected Settle Cash</span>
                  <p className="text-sm font-black text-white font-mono mt-0.5">{expectedCash} EGP</p>
                </div>
                <div className="bg-[#131722] p-3 rounded-xl border border-[#1F293D]">
                  <span className="text-muted-foreground text-[10px]">Cash sales</span>
                  <p className="text-sm font-black text-[#00FFA3] font-mono mt-0.5">+{cashSales} EGP</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Actual Cash Counted (EGP)</label>
                  <input
                    type="number"
                    className="input-field py-2 w-full text-xs"
                    placeholder="Enter physical cash in drawer..."
                    value={actualCash}
                    onChange={e => setActualCash(e.target.value)}
                    required
                  />
                </div>

                {actualCash !== '' && cashDiff !== 0 && (
                  <div className="space-y-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    <p className="font-bold flex items-center gap-1"><AlertOctagon size={13} /> Cash Discrepancy: {cashDiff} EGP</p>
                    <input
                      type="text"
                      className="input-field border-red-500/30 text-xs py-1.5 w-full bg-[#0B0F19]"
                      placeholder="Mandatory explanation for cash difference..."
                      value={cashExplanation}
                      onChange={e => setCashExplanation(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: INVENTORY */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><Package size={15} className="text-primary" /> Step 2: Manual Stock Counting</h3>
              <p className="text-[10px] text-muted-foreground">Verify physical stock remaining in the lounge café shelves.</p>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {products.map(p => {
                  const counted = Number(invCounts[p.id] || 0);
                  const diff = counted - p.stock;
                  return (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-[#131722] border border-[#1F293D] rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <span className="text-[9px] text-muted-foreground font-mono">Expected: {p.stock} units</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          className="input-field py-1 w-16 text-center text-xs"
                          value={invCounts[p.id]}
                          onChange={e => handleInvCountChange(p.id, e.target.value)}
                          required
                        />
                        {diff !== 0 && (
                          <span className="text-[10px] font-bold text-red-400">Diff: {diff}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: HARDWARE */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><Gamepad2 size={15} className="text-primary" /> Step 3: Hardware Station Audit</h3>
              <p className="text-[10px] text-muted-foreground">Inspect gamepads and consoles for drift, check-in errors or damage.</p>

              <div className="p-4 bg-[#131722] border border-[#1F293D] rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id="hw"
                    className="w-4 h-4 text-primary bg-transparent border-slate-700 rounded"
                    checked={hwConfirmed}
                    onChange={e => setHwConfirmed(e.target.checked)}
                  />
                  <label htmlFor="hw" className="font-bold text-slate-300 select-none cursor-pointer">
                    I verify that all controllers and PlayStation consoles are accounted for and condition logs updated.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: OPERATIONS SUMMARY */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><ScrollText size={15} className="text-primary" /> Step 4: Operations Summary Review</h3>
              
              <div className="space-y-2 text-xs text-slate-300 pt-1">
                <div className="flex justify-between py-2 border-b border-[#1F293D]">
                  <span>Sessions Handled</span>
                  <span className="font-bold text-white font-mono">{activeShift.sessionsHandledCount} sessions</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1F293D]">
                  <span>Logged Sales Count</span>
                  <span className="font-bold text-white font-mono">{activeShift.salesCount} items</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1F293D]">
                  <span>Total Revenue Generated</span>
                  <span className="font-bold text-[#00FFA3] font-mono">{activeShift.revenue} EGP</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: NOTES / ISSUES */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><AlertOctagon size={15} className="text-primary" /> Step 5: Report Operational Issues</h3>
              <p className="text-[10px] text-muted-foreground">Add description of maintenance failures, inventory discrepancy reasons, or customer disputes.</p>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Settle Closing Notes</label>
                <textarea
                  className="input-field py-2 w-full text-xs min-h-[100px]"
                  placeholder="Describe shift incidents..."
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION */}
          {step === 6 && (
            <div className="space-y-4 text-center py-6">
              <CheckCircle2 size={48} className="mx-auto text-primary animate-bounce" />
              <h3 className="text-sm font-extrabold text-white">Shift Settle Audit Ready</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">Click "Settle Shift Now" to submit all financial, cash, and inventory details to management.</p>
            </div>
          )}

          {/* Buttons Navigation */}
          <div className="flex gap-2 pt-4 border-t border-[#1F293D] flex-shrink-0">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn-secondary px-4 py-2 text-xs flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary ml-auto px-4 py-2 text-xs flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,163,0.1)]"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary ml-auto px-5 py-2 text-xs font-black shadow-[0_0_15px_rgba(0,255,163,0.2)]"
              >
                Settle Shift Now
              </button>
            )}
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
