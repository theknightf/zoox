'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert,
  ArrowRight, Check, X, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ActionCenterPage() {
  const router = useRouter();
  const {
    currentRole,
    actionAlerts,
    resolveActionAlert
  } = useApp();

  const unresolved = actionAlerts.filter(a => !a.resolved);
  const resolved = actionAlerts.filter(a => a.resolved);

  const handleResolve = (id) => {
    resolveActionAlert(id);
    toast.success('Alert marked as resolved.');
  };

  const getAlertIcon = (type, severity) => {
    if (severity === 'Critical') return <AlertCircle className="text-red-400" size={18} />;
    if (severity === 'Warning') return <AlertTriangle className="text-warning" size={18} />;
    return <Info className="text-info" size={18} />;
  };

  const handleQuickAction = (alertObj) => {
    // Navigate cashier / manager to appropriate resolve route
    if (alertObj.type === 'Cash Discrepancy' || alertObj.type === 'Inventory Discrepancy') {
      router.push('/shifts');
    } else if (alertObj.type === 'Expense Pending') {
      router.push('/expenses');
    } else if (alertObj.type === 'Withdrawal Pending') {
      router.push('/withdrawals');
    } else if (alertObj.type === 'Payroll Pending') {
      router.push('/payroll');
    } else if (alertObj.type === 'Late Employee') {
      router.push('/attendance');
    } else {
      handleResolve(alertObj.id);
    }
  };

  return (
    <AppLayout currentPath="/action-center">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><AlertCircle size={18} /></span>
            Operational Alert &amp; Action Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">One-stop queue to review, investigate, and settle cashier errors, stock alerts, and late attendances.</p>
        </div>

        {/* Alerts queue list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left panel: Unresolved queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Unresolved Alerts Queue ({unresolved.length})</h2>

              <div className="space-y-3">
                {unresolved.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                    <ShieldCheck className="mx-auto text-primary" size={32} />
                    <p className="font-bold text-white">System Settle Integrity Compliant</p>
                    <p className="opacity-75">All cashier counts, treasury cash states, and check-ins match parameters.</p>
                  </div>
                ) : (
                  unresolved.map(a => (
                    <div key={a.id} className="p-4 bg-[#131722] border border-[#1F293D] rounded-xl flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">{getAlertIcon(a.type, a.severity)}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{a.type}</span>
                            <span className={"px-1.5 py-0.5 rounded text-[8px] font-black uppercase " + (a.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : a.severity === 'Warning' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-info/10 text-info border border-info/20')}>
                              {a.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{a.message}</p>
                          <span className="text-[9px] text-muted-foreground font-mono block mt-1">Logged: {new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleQuickAction(a)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,163,0.15)]"
                        >
                          Investigate <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={() => handleResolve(a.id)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Resolved history */}
          <div className="lg:col-span-1 bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Resolved History logs</h2>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {resolved.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No resolved alerts logged.</p>
              ) : (
                resolved.map(a => (
                  <div key={a.id} className="p-3 bg-[#131722] border border-[#1F293D]/60 rounded-xl text-xs space-y-1 opacity-70">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{a.type}</span>
                      <span className="text-[8px] uppercase tracking-wider text-primary">Resolved</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
