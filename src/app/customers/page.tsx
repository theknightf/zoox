'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import type { LoyaltyTier } from '@/types';
import {
  Users, Search, Award, History, X,
  ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { toast } from 'sonner';

const TIER: Record<LoyaltyTier, { badge: string; dot: string; glow: string }> = {
  Platinum: { badge: 'text-cyan-300 bg-cyan-900/20 border-cyan-500/30', dot: 'bg-cyan-400', glow: 'shadow-[0_0_18px_rgba(34,211,238,0.18)]' },
  Gold:     { badge: 'text-yellow-300 bg-yellow-900/20 border-yellow-500/30', dot: 'bg-yellow-400', glow: 'shadow-[0_0_18px_rgba(250,204,21,0.18)]' },
  Silver:   { badge: 'text-slate-300 bg-slate-700/20 border-slate-400/30', dot: 'bg-slate-400', glow: '' },
  Bronze:   { badge: 'text-orange-300 bg-orange-900/20 border-orange-500/30', dot: 'bg-orange-400', glow: '' },
};

export default function CustomersPage() {
  const { currentRole, customers, adjustPoints } = useApp();

  const [search, setSearch]       = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | LoyaltyTier>('All');
  const [sortBy, setSortBy]       = useState<'visits' | 'spent' | 'points' | 'lastVisit'>('visits');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adjMode, setAdjMode]     = useState<'add' | 'deduct'>('add');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const filtered = customers
    .filter((p) => {
      const q = search.toLowerCase();
      return (p.name.toLowerCase().includes(q) || p.phone.includes(q)) &&
             (tierFilter === 'All' || p.tier === tierFilter);
    })
    .sort((a, b) => {
      const diff =
        sortBy === 'visits'    ? a.visits - b.visits :
        sortBy === 'spent'     ? a.spent - b.spent :
        sortBy === 'points'    ? a.points - b.points :
        new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
      return sortDir === 'desc' ? -diff : diff;
    });

  const profile = customers.find((p) => p.id === selectedId);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  const handleAdjust = () => {
    if (!profile) return;
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      toast.error('Only Owner / Manager can adjust points.'); return;
    }
    const val = parseInt(adjAmount);
    if (!val || val <= 0) { toast.error('Enter a valid positive amount.'); return; }
    if (!adjReason.trim()) { toast.error('A reason is required.'); return; }
    adjustPoints(profile.id, adjMode === 'add' ? val : -val, adjReason);
    toast.success(`${adjMode === 'add' ? '+' : '−'}${val} pts applied to ${profile.name}`);
    setAdjAmount(''); setAdjReason('');
  };

  const SortArrow = ({ col }: { col: typeof sortBy }) =>
    sortBy === col
      ? sortDir === 'desc' ? <ChevronDown size={10} className="text-primary" /> : <ChevronUp size={10} className="text-primary" />
      : <ChevronDown size={10} className="opacity-25" />;

  const totalSpent  = customers.reduce((s, c) => s + c.spent, 0);
  const totalPts    = customers.reduce((s, c) => s + c.points, 0);
  const platCount   = customers.filter((c) => c.tier === 'Platinum').length;

  return (
    <AppLayout currentPath="/customers">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><Users size={18} /></span>
              Customers &amp; Loyalty CRM
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Registered guests · Loyalty tiers · Session history · Points</p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-2">
              <p className="text-muted-foreground leading-none mb-1">Guests</p>
              <p className="font-black text-white font-mono text-sm">{customers.length}</p>
            </div>
            <div className="bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-2">
              <p className="text-muted-foreground leading-none mb-1">Revenue</p>
              <p className="font-black text-[#00FFA3] font-mono text-sm">{totalSpent.toLocaleString()} EGP</p>
            </div>
            <div className="bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-2">
              <p className="text-muted-foreground leading-none mb-1">Points</p>
              <p className="font-black text-[#8B5CF6] font-mono text-sm">{totalPts.toLocaleString()}</p>
            </div>
            <div className="bg-[#131722] border border-cyan-500/20 rounded-xl px-3 py-2">
              <p className="text-muted-foreground leading-none mb-1">Platinum</p>
              <p className="font-black text-cyan-300 font-mono text-sm">{platCount}</p>
            </div>
          </div>
        </div>

        {/* ── Directory Table ── */}
        <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden">

          {/* Toolbar */}
          <div className="p-4 border-b border-[#1F293D] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-2 w-full sm:w-72 focus-within:border-primary/40 transition-colors">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                className="bg-transparent text-xs text-white placeholder-muted-foreground w-full focus:outline-none"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Platinum', 'Gold', 'Silver', 'Bronze'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    tierFilter === t
                      ? t === 'All' ? 'bg-primary/20 border-primary/50 text-primary' : `${TIER[t as LoyaltyTier].badge}`
                      : 'bg-transparent border-[#1F293D] text-muted-foreground hover:border-white/20'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Guest</th>
                  <th className="py-3 px-4 font-bold">Tier</th>
                  <th className="py-3 px-4 font-bold cursor-pointer hover:text-white select-none" onClick={() => toggleSort('points')}>
                    <span className="flex items-center gap-1">Points <SortArrow col="points" /></span>
                  </th>
                  <th className="py-3 px-4 font-bold cursor-pointer hover:text-white select-none" onClick={() => toggleSort('visits')}>
                    <span className="flex items-center gap-1">Visits <SortArrow col="visits" /></span>
                  </th>
                  <th className="py-3 px-4 font-bold cursor-pointer hover:text-white select-none" onClick={() => toggleSort('spent')}>
                    <span className="flex items-center gap-1">Spent <SortArrow col="spent" /></span>
                  </th>
                  <th className="py-3 px-4 font-bold cursor-pointer hover:text-white select-none" onClick={() => toggleSort('lastVisit')}>
                    <span className="flex items-center gap-1">Last Visit <SortArrow col="lastVisit" /></span>
                  </th>
                  <th className="py-3 px-4 font-bold text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No customers found.</td></tr>
                )}
                {filtered.map((p) => {
                  const ts = TIER[p.tier];
                  return (
                    <tr key={p.id} onClick={() => setSelectedId(p.id)}
                      className="hover:bg-white/[0.025] cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border flex-shrink-0 ${ts.badge} ${ts.glow}`}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ts.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} /> {p.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#8B5CF6]">{p.points.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1 text-[10px]">pts</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{p.visits}×</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#00FFA3]">{p.spent.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1 text-[10px]">EGP</span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[10px]">{p.lastVisit}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition-all">
                          <History size={10} /> Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#1F293D] flex justify-between text-[10px] text-muted-foreground">
            <span>{filtered.length} / {customers.length} guests shown</span>
            <span>Click any row to view full profile</span>
          </div>
        </div>
      </div>

      {/* ── Profile Side Drawer ── */}
      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative z-10 bg-[#0B0F19] border-l border-[#1F293D] w-full max-w-[420px] h-full flex flex-col overflow-hidden shadow-[-20px_0_60px_rgba(0,0,0,0.6)]">

            {/* Drawer Header */}
            <div className="p-5 border-b border-[#1F293D] flex-shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${TIER[profile.tier].badge} ${TIER[profile.tier].glow}`}>
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">{profile.name}</h2>
                    <p className="text-[10px] text-muted-foreground font-mono">{profile.phone}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${TIER[profile.tier].badge}`}>
                      <Star size={9} /> {profile.tier} Member
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Visits', value: profile.visits + '×', color: 'text-white' },
                  { label: 'Spent', value: profile.spent.toLocaleString() + ' EGP', color: 'text-[#00FFA3]' },
                  { label: 'Points', value: profile.points.toLocaleString(), color: 'text-[#8B5CF6]' }
                ].map((s) => (
                  <div key={s.label} className="bg-[#131722] border border-[#1F293D] rounded-xl p-3 text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">{s.label}</span>
                    <span className={`text-sm font-black font-mono ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Points Adjustment */}
              {(currentRole === 'owner' || currentRole === 'manager') && (
                <div className="bg-[#131722] border border-[#1F293D] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award size={13} className="text-primary" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Adjust Points</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setAdjMode('add')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${adjMode === 'add' ? 'bg-primary/15 border-primary/50 text-primary' : 'border-[#1F293D] text-muted-foreground'}`}>+ Add</button>
                    <button onClick={() => setAdjMode('deduct')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${adjMode === 'deduct' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'border-[#1F293D] text-muted-foreground'}`}>− Deduct</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" className="input-field text-xs py-2 flex-1" placeholder="Points" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
                    <input type="text" className="input-field text-xs py-2 flex-1" placeholder="Reason..." value={adjReason} onChange={(e) => setAdjReason(e.target.value)} />
                  </div>
                  <button onClick={handleAdjust} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors">
                    Apply Adjustment
                  </button>
                </div>
              )}

              {/* Session History */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <History size={11} className="text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Session &amp; Order History</span>
                </div>
                {profile.history.length === 0
                  ? <p className="text-xs text-muted-foreground italic text-center py-4">No history yet.</p>
                  : (
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                      {profile.history.map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-[#131722] border border-[#1F293D]/60 rounded-xl">
                          <div>
                            <p className="font-semibold text-white text-[11px]">{log.action}</p>
                            <span className="text-[9px] font-mono text-muted-foreground">{log.date}</span>
                          </div>
                          <span className="font-mono font-bold text-[#00FFA3] text-[11px]">{log.amount} EGP</span>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>

              {/* Lost Items */}
              {profile.lostItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Linked Found Items</span>
                  {profile.lostItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-warning/5 border border-warning/20 rounded-xl">
                      <div>
                        <p className="font-semibold text-warning text-[11px]">{item.desc}</p>
                        <span className="text-[9px] text-warning/60">{item.date}</span>
                      </div>
                      <span className="text-[9px] bg-warning/15 border border-warning/30 px-2 py-0.5 rounded font-bold uppercase text-warning">{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#1F293D] flex-shrink-0">
              <button onClick={() => setSelectedId(null)} className="btn-secondary w-full py-2.5 text-xs">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
