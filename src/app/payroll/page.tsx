'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  DollarSign, Calculator, CheckCircle2, AlertTriangle, Users,
  Calendar, CreditCard, ChevronRight, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function PayrollPage() {
  const {
    currentRole,
    payrollPeriods,
    calculatePayroll,
    payPayrollItem,
    employees
  } = useApp();

  const [month, setMonth] = useState(8); // Default August
  const [year, setYear] = useState(2026);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash');

  const handleGenerate = () => {
    if (currentRole !== 'owner') {
      toast.error('Only Lounge Owner can process payroll statements.');
      return;
    }
    calculatePayroll(month, year);
    toast.success('Generated payroll period: ' + year + '-' + String(month).padStart(2, '0'));
    setSelectedPeriodId(year + '-' + String(month).padStart(2, '0'));
  };

  const handlePay = (periodId, employeeId) => {
    payPayrollItem(periodId, employeeId, payMethod);
    toast.success('Payroll salary paid out to staff member.');
  };

  const currentPeriod = payrollPeriods.find(p => p.id === selectedPeriodId);

  return (
    <AppLayout currentPath="/payroll">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><DollarSign size={18} /></span>
              Payroll Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Generate monthly payroll calculations based on basic contract, late check-ins, overtime, and advances.</p>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calculator size={15} className="text-primary" /> Run Payroll Period
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Month</label>
                <select className="input-field py-2 w-full" value={month} onChange={e => setMonth(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Year</label>
                <select className="input-field py-2 w-full" value={year} onChange={e => setYear(Number(e.target.value))}>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(0,255,163,0.1)] transition-colors"
            >
              Calculate Payroll Sheet
            </button>

            {/* Select existing calculated periods */}
            {payrollPeriods.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#1F293D]">
                <label className="text-[9px] text-muted-foreground font-bold uppercase block">Previous Calculations</label>
                <div className="space-y-1.5">
                  {payrollPeriods.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPeriodId(p.id)}
                      className={"p-2.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center text-xs " + (selectedPeriodId === p.id ? "bg-primary/10 border-primary/30 text-white" : "bg-[#131722] border-[#1F293D] text-slate-300")}
                    >
                      <span className="font-bold">Period: {p.id}</span>
                      <ChevronRight size={14} className="opacity-70" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payroll sheet view */}
          <div className="lg:col-span-2 space-y-4">
            {currentPeriod ? (
              <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-extrabold text-white">Payroll Sheet: Period {currentPeriod.id}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Pay Out Method</label>
                    <select className="input-field py-1 px-2 text-xs" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Vodafone Cash">Vodafone Cash</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider">
                        <th className="py-2 px-2 font-bold">Staff</th>
                        <th className="py-2 px-2 font-bold">Present / Expected</th>
                        <th className="py-2 px-2 font-bold">Base Salary</th>
                        <th className="py-2 px-2 font-bold">Overtime +</th>
                        <th className="py-2 px-2 font-bold">Deductions -</th>
                        <th className="py-2 px-2 font-bold">Advances -</th>
                        <th className="py-2 px-2 font-bold">Net Salary</th>
                        <th className="py-2 px-2 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F293D]/50 text-slate-300">
                      {currentPeriod.items.map(item => {
                        const emp = employees.find(e => e.id === item.employeeId);
                        return (
                          <tr key={item.id} className="hover:bg-white/[0.025]">
                            <td className="py-3 px-2">
                              <p className="font-bold text-white">{emp ? emp.name : 'Staff Member'}</p>
                              <span className="text-[9px] text-muted-foreground">{emp ? emp.jobTitle : ''}</span>
                            </td>
                            <td className="py-3 px-2 font-mono">{item.presentDays} / {item.workingDays} days</td>
                            <td className="py-3 px-2 font-mono">{item.basicSalary.toLocaleString()} EGP</td>
                            <td className="py-3 px-2 font-mono text-primary">+{item.overtimePay} EGP</td>
                            <td className="py-3 px-2 font-mono text-red-400">-{item.deductions} EGP</td>
                            <td className="py-3 px-2 font-mono text-warning">-{item.advances} EGP</td>
                            <td className="py-3 px-2 font-mono font-bold text-white">{item.netSalary.toLocaleString()} EGP</td>
                            <td className="py-3 px-2 text-right">
                              {item.status === 'Paid' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border border-primary/20 bg-primary/5 text-primary uppercase">
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePay(currentPeriod.id, item.employeeId)}
                                  className="px-2 py-1 bg-primary hover:bg-primary/95 text-white rounded font-bold text-[10px] shadow-[0_0_8px_rgba(0,255,163,0.15)]"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B0F19] border border-[#1F293D] p-12 text-center text-muted-foreground rounded-2xl text-xs space-y-2">
                <AlertTriangle className="mx-auto text-warning" size={24} />
                <p>No payroll calculations compiled.</p>
                <p className="opacity-75">Select a month and year and click "Calculate Payroll Sheet" to start review.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
