'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import type { Employee, UserRole } from '@/types';
import {
  Users, Search, UserPlus, Shield, Phone, Calendar,
  DollarSign, Clock, MapPin, Briefcase, Award, X,
  AlertTriangle, CheckCircle, FileText, ChevronRight, TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const {
    currentRole,
    employees,
    addEmployee,
    updateEmployee,
    attendanceRecords,
    withdrawals,
    shifts
  } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('Operations');
  const [formSalary, setFormSalary] = useState('');
  const [formSalaryType, setFormSalaryType] = useState<'Monthly' | 'Hourly'>('Monthly');

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.name.toLowerCase().includes(q) || e.phone.includes(q);
    const matchRole = roleFilter === 'All' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formPhone || !formTitle || !formSalary) {
      toast.error('All fields are required.');
      return;
    }
    addEmployee({
      name: formName,
      phone: formPhone,
      role: formRole,
      jobTitle: formTitle,
      department: formDept,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      baseSalary: Number(formSalary),
      salaryType: formSalaryType
    });
    toast.success('Employee profile created successfully.');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditClick = (emp) => {
    setFormName(emp.name);
    setFormPhone(emp.phone);
    setFormRole(emp.role);
    setFormTitle(emp.jobTitle);
    setFormDept(emp.department);
    setFormSalary(String(emp.baseSalary));
    setFormSalaryType(emp.salaryType);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    updateEmployee({
      ...selectedEmp,
      name: formName,
      phone: formPhone,
      role: formRole,
      jobTitle: formTitle,
      department: formDept,
      baseSalary: Number(formSalary),
      salaryType: formSalaryType
    });
    toast.success('Employee profile updated.');
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormRole('staff');
    setFormTitle('');
    setFormDept('Operations');
    setFormSalary('');
    setFormSalaryType('Monthly');
  };

  // 360 Stats Computations
  const getEmpStats = (empId) => {
    const records = attendanceRecords.filter(r => r.employeeId === empId);
    const totalWorkingHours = records.reduce((s, r) => s + r.totalWorkingHours, 0);
    const totalLateMinutes = records.reduce((s, r) => s + r.lateMinutes, 0);
    const totalAdvances = withdrawals.filter(w => w.employeeId === empId && w.status === 'Approved').reduce((s, w) => s + w.amount, 0);
    const totalShifts = shifts.filter(s => s.assignedEmployeeIds.includes(empId)).length;
    return { totalWorkingHours, totalLateMinutes, totalAdvances, totalShifts };
  };

  return (
    <AppLayout currentPath="/employees">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><Users size={18} /></span>
              Employees HR Directory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage lounge hosts, cashiers, payroll settings, and job profiles.</p>
          </div>
          {currentRole === 'owner' && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
            >
              <UserPlus size={14} /> Add Employee
            </button>
          )}
        </div>

        {/* Grid & Table */}
        <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-[#1F293D] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-2 w-full sm:w-72">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                className="bg-transparent text-xs text-white placeholder-muted-foreground w-full focus:outline-none"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'owner', 'manager', 'staff'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    roleFilter === r
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-transparent border-[#1F293D] text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Staff Member</th>
                  <th className="py-3 px-4 font-bold">Role &amp; Title</th>
                  <th className="py-3 px-4 font-bold">Base Salary</th>
                  <th className="py-3 px-4 font-bold">Hire Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50">
                {filtered.map(emp => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className="hover:bg-white/[0.025] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${emp.role === 'owner' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : emp.role === 'manager' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-info/10 text-info border border-info/20'}`}>
                          {emp.role}
                        </span>
                        <span className="text-slate-300 text-[10px]">{emp.jobTitle}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {emp.baseSalary.toLocaleString()} EGP <span className="text-[9px] text-muted-foreground">/{emp.salaryType.toLowerCase().replace('ly', '')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono">{emp.hireDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${emp.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-700/25 text-slate-400 border-slate-700/40'}`}>
                        <span className={`w-1 h-1 rounded-full ${emp.status === 'Active' ? 'bg-primary' : 'bg-slate-400'}`} />
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="px-2 py-1 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg font-bold text-[10px]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee 360 Drawer */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedEmpId(null)} />
          <div className="relative z-10 bg-[#0B0F19] border-l border-[#1F293D] w-full max-w-[460px] h-full flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1F293D] flex justify-between items-start flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-base">
                  {selectedEmp.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">{selectedEmp.name}</h2>
                  <p className="text-[10px] text-muted-foreground font-mono">{selectedEmp.phone}</p>
                  <p className="text-[10px] text-primary font-semibold mt-1">{selectedEmp.jobTitle} · {selectedEmp.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmpId(null)} className="text-muted-foreground hover:text-white p-1 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Quick metrics */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Hrs worked', value: getEmpStats(selectedEmp.id).totalWorkingHours + 'h', color: 'text-white' },
                  { label: 'Late mins', value: getEmpStats(selectedEmp.id).totalLateMinutes + 'm', color: 'text-red-400' },
                  { label: 'Advances', value: getEmpStats(selectedEmp.id).totalAdvances + ' EGP', color: 'text-warning' },
                  { label: 'Shifts', value: getEmpStats(selectedEmp.id).totalShifts, color: 'text-[#8B5CF6]' }
                ].map((m, i) => (
                  <div key={i} className="bg-[#131722] border border-[#1F293D] rounded-xl p-2 text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">{m.label}</span>
                    <span className={`text-xs font-black font-mono ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Personal & Employment Contracts */}
              <div className="bg-[#131722] border border-[#1F293D] rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                  <Briefcase size={12} /> Employment contract info
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Salary Type</p>
                    <p className="font-bold text-white mt-0.5">{selectedEmp.salaryType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Monthly Base</p>
                    <p className="font-bold text-[#00FFA3] mt-0.5">{selectedEmp.baseSalary.toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Department</p>
                    <p className="font-bold text-white mt-0.5">{selectedEmp.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Hire Date</p>
                    <p className="font-bold text-white mt-0.5">{selectedEmp.hireDate}</p>
                  </div>
                </div>
              </div>

              {/* Attendance logs */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Recent Attendance History</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {attendanceRecords.filter(r => r.employeeId === selectedEmp.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No attendance records found.</p>
                  ) : (
                    attendanceRecords.filter(r => r.employeeId === selectedEmp.id).map(rec => (
                      <div key={rec.id} className="p-2.5 bg-[#131722] border border-[#1F293D]/60 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{rec.date}</p>
                          <span className="text-[9px] text-muted-foreground font-mono">{rec.checkInTime} {rec.checkOutTime ? `→ ${rec.checkOutTime}` : '(Active)'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${rec.status === 'Present' ? 'text-primary bg-primary/10 border-primary/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                          {rec.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Financial Ledger (salary, deductions, advances) */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Financial Ledger &amp; Cash Advances</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {withdrawals.filter(w => w.employeeId === selectedEmp.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No advance transactions logged.</p>
                  ) : (
                    withdrawals.filter(w => w.employeeId === selectedEmp.id).map(wth => (
                      <div key={wth.id} className="p-2.5 bg-[#131722] border border-[#1F293D]/60 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">Cash Advance withdrawal</p>
                          <span className="text-[9px] text-muted-foreground font-mono">{wth.date} · {wth.reason}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-400 font-mono">-{wth.amount} EGP</p>
                          <span className="text-[8px] uppercase tracking-wider text-slate-400">{wth.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#1F293D] flex-shrink-0">
              <button onClick={() => setSelectedEmpId(null)} className="btn-secondary w-full py-2.5 text-xs">
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Employee Profile</h3>
            <div className="space-y-3">
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Full Name" value={formName} onChange={e => setFormName(e.target.value)} required />
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Phone Number" value={formPhone} onChange={e => setFormPhone(e.target.value)} required />
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Job Title (e.g. Host, Barista)" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
              <input type="number" className="input-field text-xs py-2 w-full" placeholder="Base Salary (EGP)" value={formSalary} onChange={e => setFormSalary(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select className="input-field py-2" value={formRole} onChange={e => setFormRole(e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
                <select className="input-field py-2" value={formSalaryType} onChange={e => setFormSalaryType(e.target.value)}>
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Save Employee</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowEditModal(false)} />
          <form onSubmit={handleEditSubmit} className="relative z-10 bg-[#0B0F19] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Edit Employee Profile</h3>
            <div className="space-y-3">
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Full Name" value={formName} onChange={e => setFormName(e.target.value)} required />
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Phone Number" value={formPhone} onChange={e => setFormPhone(e.target.value)} required />
              <input type="text" className="input-field text-xs py-2 w-full" placeholder="Job Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
              <input type="number" className="input-field text-xs py-2 w-full" placeholder="Base Salary" value={formSalary} onChange={e => setFormSalary(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select className="input-field py-2" value={formRole} onChange={e => setFormRole(e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
                <select className="input-field py-2" value={formSalaryType} onChange={e => setFormSalaryType(e.target.value)}>
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-4 py-2 text-xs">Update Profile</button>
            </div>
          </form>
        </div>
      )}

    </AppLayout>
  );
}
