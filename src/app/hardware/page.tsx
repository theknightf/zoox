'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { Gamepad2, Wrench, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

export default function HardwarePage() {
  const { controllers, currentRole } = useApp();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Good' | 'Stick Drift' | 'Broken Buttons' | 'Under Repair / Checkup'
  >('All');

  // Local list to allow visual repairs mock
  const [localControllers, setLocalControllers] = useState(controllers);

  const handleResolve = (id: string) => {
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      toast.error(
        t('Permission Denied: Only Managers/Owners can log hardware replacements or repairs.')
      );
      return;
    }
    setLocalControllers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'Good', lastInspectedAt: new Date().toLocaleDateString() } : c
      )
    );
    toast.success(`${t('Resolved issues on controller')} ${id}. ${t('Marked as Good!')}`);
  };

  const filtered = localControllers.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const summary = localControllers.reduce(
    (acc, curr) => {
      if (acc[curr.status] !== undefined) {
        acc[curr.status]++;
      }
      return acc;
    },
    { Good: 0, 'Stick Drift': 0, 'Broken Buttons': 0, 'Under Repair / Checkup': 0 }
  );

  return (
    <AppLayout currentPath="/hardware">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('Hardware & Accessory Tracker')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('Monitor hardware lifespans, manage controller defects, and authorize repairs.')}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-base p-4 bg-accent/5 border-accent/20">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('Ready / Good')}
            </span>
            <span className="text-xl font-black text-accent">
              {summary.Good} {t('Pads')}
            </span>
          </div>
          <div className="card-base p-4 bg-warning/5 border-warning/20">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('Stick Drift')}
            </span>
            <span className="text-xl font-black text-warning">
              {summary['Stick Drift']} {t('Pads')}
            </span>
          </div>
          <div className="card-base p-4 bg-danger/5 border-danger/20">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('Broken Buttons')}
            </span>
            <span className="text-xl font-black text-danger">
              {summary['Broken Buttons']} {t('Pads')}
            </span>
          </div>
          <div className="card-base p-4 bg-indigo-500/5 border-indigo-500/20">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('Under Checkup')}
            </span>
            <span className="text-xl font-black text-indigo-400">
              {summary['Under Repair / Checkup']} {t('Pads')}
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1 border-b border-border/50 pb-4">
          {(
            ['All', 'Good', 'Stick Drift', 'Broken Buttons', 'Under Repair / Checkup'] as const
          ).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                statusFilter === filter
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(filter)}
            </button>
          ))}
        </div>

        {/* Controller grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {filtered.map((ctrl) => {
            const hasIssue = ctrl.status !== 'Good';
            return (
              <div
                key={ctrl.id}
                className={`card-base p-4 border transition-all duration-200 ${
                  ctrl.status === 'Good'
                    ? 'hover:border-accent/40 border-border bg-card'
                    : ctrl.status === 'Under Repair / Checkup'
                      ? 'border-indigo-500/30 bg-indigo-500/5'
                      : ctrl.status === 'Stick Drift'
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-danger/30 bg-danger/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-secondary rounded-lg border border-border">
                    <Gamepad2
                      size={20}
                      className={ctrl.status === 'Good' ? 'text-accent' : 'text-foreground'}
                    />
                  </div>

                  {ctrl.status === 'Under Repair / Checkup' ? (
                    <Wrench size={16} className="text-indigo-400 animate-pulse" />
                  ) : hasIssue ? (
                    <AlertTriangle size={16} className="text-warning" />
                  ) : (
                    <CheckCircle size={16} className="text-accent" />
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-foreground font-mono">{ctrl.id}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t('Inspected:')} {ctrl.lastInspectedAt}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-border/20 flex flex-col gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block text-center border ${
                      ctrl.status === 'Good'
                        ? 'bg-accent/15 border-accent/30 text-accent'
                        : ctrl.status === 'Under Repair / Checkup'
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                          : ctrl.status === 'Stick Drift'
                            ? 'bg-warning/15 border-warning/30 text-warning'
                            : 'bg-danger/15 border-danger/30 text-danger'
                    }`}
                  >
                    {t(ctrl.status)}
                  </span>

                  {hasIssue && (
                    <button
                      onClick={() => handleResolve(ctrl.id)}
                      className="w-full text-center py-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] font-extrabold rounded-md flex items-center justify-center gap-1 mt-1"
                    >
                      <RefreshCcw size={10} />
                      {t('REPAIR RESOLVED')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
