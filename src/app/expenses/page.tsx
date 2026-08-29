'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  Receipt, PlusCircle, CheckCircle, XCircle, Clock,
  Calendar, Users, DollarSign, Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const {
    currentRole,
    expenses,
    addExpense,
    approveExpense,
    employees
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Maintenance');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Vodafone Cash'>('Cash');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const val = Number(expenseAmount);
    if (!val || val <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (!expenseDesc.trim()) {
      toast.error('Enter expense description.');
      return;
    }

    addExpense({
      amount: val,
      category: expenseCategory as any,
      description: expenseDesc,
      date: new Date().toISOString().split('T')[0],
      employeeId: 'emp-1', // Default staff logged in
      paymentMethod
    });

    toast.success('Expense submitted. Pending manager approval.');
    setShowAddModal(false);
    setExpenseAmount('');
    setExpenseDesc('');
  };

  const handleApprove = (id) => {
    approveExpense(id);
    toast.success('Expense successfully approved and paid out.');
  };

  return (
    <AppLayout currentPath="/expenses">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><Receipt size={18} /></span>
              Expense Management Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track bills, maintenance costs, and food/café supplier purchases.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
          >
            <PlusCircle size={14} /> Record Expense
          </button>
        </div>

        {/* Expenses List */}
        <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden p-5 space-y-4">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider text-muted-foreground">Expense Records Queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 font-bold">Details</th>
                  <th className="py-2 px-2 font-bold">Category</th>
                  <th className="py-2 px-2 font-bold">Amount</th>
                  <th className="py-2 px-2 font-bold">Logged By</th>
                  <th className="py-2 px-2 font-bold">Payment Method</th>
                  <th className="py-2 px-2 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50 text-slate-300">
                {expenses.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No expenses logged.</td></tr>
                ) : (
                  expenses.map(e => {
                    const emp = employees.find(empObj => empObj.id === e.employeeId);
                    return (
                      <tr key={e.id} className="hover:bg-white/[0.025]">
                        <td className="py-3 px-2">
                          <p className="font-bold text-white">{e.description}</p>
                          <span className="text-[9px] text-muted-foreground font-mono">{e.date}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#131722] border border-[#1F293D]">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-white">{e.amount} EGP</td>
                        <td className="py-3 px-2 text-slate-300">{emp ? emp.name : 'Staff Member'}</td>
                        <td className="py-3 px-2 font-mono">{e.paymentMethod}</td>
                        <td className="py-3 px-2 text-right">
                          {e.status === 'Pending' ? (
                            <div className="flex justify-end gap-1.5" onClick={(evt) => evt.stopPropagation()}>
                              {(currentRole === 'owner' || currentRole === 'manager') ? (
                                <button
                                  onClick={() => handleApprove(e.id)}
                                  className="px-2 py-1 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 rounded-lg text-[9px] font-bold"
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-warning/20 bg-warning/5 text-warning uppercase">
                                  Pending Review
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={"px-2 py-0.5 rounded text-[9px] font-bold border " + (e.status === 'Approved' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-red-500/20 bg-red-500/5 text-red-400') + " uppercase"}>
                              {e.status}
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

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Record Outbound Expense</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Expense Category</label>
                <select className="input-field py-2 w-full" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                  {['Maintenance', 'Electricity', 'Internet', 'Cleaning', 'Supplies', 'Inventory purchase', 'Transportation', 'Salaries', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Expense Payout Amount (EGP)</label>
                <input type="number" className="input-field py-2 w-full text-xs" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Payment Method</label>
                <select className="input-field py-2 w-full" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Vodafone Cash">Vodafone Cash</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-bold uppercase text-[9px]">Description &amp; Notes</label>
                <input type="text" className="input-field py-2 w-full text-xs" placeholder="e.g. Bought cleaning detergent, paid electric bill" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Post Expense</button>
            </div>
          </form>
        </div>
      )}

    </AppLayout>
  );
}
