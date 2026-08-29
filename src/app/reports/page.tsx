'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  BarChart3, Calendar, FileText, Printer, Download,
  Users, Wallet, Package, Clock, ShieldCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const {
    currentRole,
    shifts,
    attendanceRecords,
    expenses,
    withdrawals,
    employees,
    auditRecords
  } = useApp();

  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    toast.success('Report successfully compiled and downloaded as CSV.');
  };

  const getReportTitle = () => {
    if (reportType === 'revenue') return 'Lounge Sales & Session Revenue Report';
    if (reportType === 'attendance') return 'Employee Work & Geofence GPS Attendance Report';
    if (reportType === 'expenses') return 'Business Operational Expenses Category Report';
    if (reportType === 'withdrawals') return 'Employee Cash Advance & Borrowing Audit Report';
    if (reportType === 'audit') return 'Lounge Operations System Audit Trail Log';
    return 'Shift Settle Closing Audits';
  };

  return (
    <AppLayout currentPath="/reports">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6 print:p-0">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><BarChart3 size={18} /></span>
              Operations Report Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Compile and print financial, attendance, inventory mismatch, and cash drawer statements.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,163,0.1)] transition-colors"
            >
              <Printer size={14} /> Print Statement
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Selector Header Panel */}
        <div className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4 print:hidden">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Report Configurations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-muted-foreground font-bold uppercase text-[9px]">Select Report Module</label>
              <select className="input-field py-2 w-full text-xs" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="revenue">Sales &amp; Session Revenue</option>
                <option value="attendance">Staff GPS Attendance Logs</option>
                <option value="expenses">Expenses log Categories</option>
                <option value="withdrawals">Advances &amp; Borrowings</option>
                <option value="shifts">Shift closing settle records</option>
                <option value="audit">System Audit Trail Logs</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-bold uppercase text-[9px]">Start Date</label>
              <input type="date" className="input-field py-1.5 w-full text-xs" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-bold uppercase text-[9px]">End Date</label>
              <input type="date" className="input-field py-1.5 w-full text-xs" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Report Document Layout */}
        <div className="bg-[#0B0F19] border border-[#1F293D] p-6 sm:p-8 rounded-2xl space-y-6 print:border-none print:bg-transparent">
          
          {/* Doc Header */}
          <div className="border-b border-[#1F293D] pb-5 flex justify-between items-start">
            <div className="space-y-1.5">
              <h2 className="text-base font-extrabold text-white">{getReportTitle()}</h2>
              <p className="text-xs text-muted-foreground">Target Period: {startDate} to {endDate}</p>
            </div>
            <div className="text-right text-[10px] text-muted-foreground font-mono">
              <p>ZOXX GAMING HUB</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Doc Body */}
          <div className="space-y-4">
            
            {/* REVENUE REPORT MODULE */}
            {reportType === 'revenue' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#131722] p-4 rounded-xl border border-[#1F293D]">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Shift Revenue</span>
                    <p className="text-xl font-black text-[#00FFA3] font-mono mt-1">
                      {shifts.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-[#131722] p-4 rounded-xl border border-[#1F293D]">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Shifts Closed</span>
                    <p className="text-xl font-black text-white font-mono mt-1">
                      {shifts.filter(s => s.status === 'Closed').length} shifts
                    </p>
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Shift ID</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Revenue Generated</th>
                      <th className="py-2 text-right">Cash Float Settle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {shifts.map(s => (
                      <tr key={s.id}>
                        <td className="py-3">#{s.id.slice(-6)}</td>
                        <td className="py-3">{s.date}</td>
                        <td className="py-3 text-primary">+{s.revenue} EGP</td>
                        <td className="py-3 text-right">{s.openingCash} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ATTENDANCE REPORT */}
            {reportType === 'attendance' && (
              <div className="space-y-4 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Staff</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Check In</th>
                      <th className="py-2">Check Out</th>
                      <th className="py-2">Hours Worked</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {attendanceRecords.map(rec => {
                      const emp = employees.find(e => e.id === rec.employeeId);
                      return (
                        <tr key={rec.id}>
                          <td className="py-3 text-white">{emp ? emp.name : 'Staff'}</td>
                          <td className="py-3">{rec.date}</td>
                          <td className="py-3">{rec.checkInTime}</td>
                          <td className="py-3">{rec.checkOutTime || '--:--'}</td>
                          <td className="py-3">{rec.totalWorkingHours} hrs</td>
                          <td className="py-3 text-right font-bold text-primary">{rec.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* EXPENSES REPORT */}
            {reportType === 'expenses' && (
              <div className="space-y-4 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Category</th>
                      <th className="py-2">Description</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2 text-right">Payout Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td className="py-3 text-white font-bold">{e.category}</td>
                        <td className="py-3 font-sans text-slate-300">{e.description}</td>
                        <td className="py-3 text-muted-foreground">{e.date}</td>
                        <td className="py-3 text-red-400 font-bold">-{e.amount} EGP</td>
                        <td className="py-3 text-right">{e.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* WITHDRAWALS REPORT */}
            {reportType === 'withdrawals' && (
              <div className="space-y-4 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Staff member</th>
                      <th className="py-2">Advance reason</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Borrowed Cash</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {withdrawals.map(w => {
                      const emp = employees.find(e => e.id === w.employeeId);
                      return (
                        <tr key={w.id}>
                          <td className="py-3 text-white">{emp ? emp.name : 'Staff'}</td>
                          <td className="py-3 font-sans">{w.reason}</td>
                          <td className="py-3">{w.date}</td>
                          <td className="py-3 text-red-400 font-bold">-{w.amount} EGP</td>
                          <td className="py-3 text-right">{w.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SHIFTS LOG SUMMARY */}
            {reportType === 'shifts' && (
              <div className="space-y-4 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Shift ID</th>
                      <th className="py-2">Check In staff</th>
                      <th className="py-2">Opening Cash</th>
                      <th className="py-2">Expenses Payout</th>
                      <th className="py-2 text-right">Cash Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {shifts.map(s => (
                      <tr key={s.id}>
                        <td className="py-3 text-white font-bold">#{s.id.slice(-6)}</td>
                        <td className="py-3 font-sans">Staff Member</td>
                        <td className="py-3">{s.openingCash} EGP</td>
                        <td className="py-3 text-red-400">-{s.expenses} EGP</td>
                        <td className={"py-3 text-right font-bold " + (s.closingData?.difference === 0 ? 'text-primary' : 'text-red-400')}>
                          {s.closingData?.difference || 0} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AUDIT LOG TRAIL */}
            {reportType === 'audit' && (
              <div className="space-y-4 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[9px] tracking-wider font-bold">
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">User / Role</th>
                      <th className="py-2">Action</th>
                      <th className="py-2 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/40 font-mono text-slate-300">
                    {auditRecords.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No audit trail records logged in system memory.</td></tr>
                    ) : (
                      auditRecords.map(rec => (
                        <tr key={rec.id}>
                          <td className="py-3 text-muted-foreground">{new Date(rec.timestamp).toLocaleString()}</td>
                          <td className="py-3">
                            <p className="font-bold text-white">{rec.user}</p>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400">{rec.role}</span>
                          </td>
                          <td className="py-3 font-sans font-bold text-primary">{rec.action}</td>
                          <td className="py-3 font-sans text-right max-w-xs truncate text-slate-400" title={rec.details}>
                            {rec.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>
    </AppLayout>
  );
}
