'use client';
import React from 'react';
import { useTranslation } from '@/i18n';
import { Clock, ShoppingCart, CreditCard, PlayCircle, Eye, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}

const typeColors: Record<string, string> = {
  Standard: 'text-muted-foreground bg-muted border-border',
  Premium: 'text-info bg-info/10 border-info/20',
  VIP: 'text-warning bg-warning/10 border-warning/20',
};

export default function ActiveSessionsList() {
  const { t } = useTranslation();
  const { sessions } = useApp();

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t('Active Hub Sessions')}</h2>
          <p className="text-xs text-muted-foreground">
            {sessions.length} {t('sessions running now')}
          </p>
        </div>
        <Link href="/live-sessions">
          <button className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
            {t('Manage All')} <Monitor size={12} />
          </button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          {t('No active sessions.')}
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {[
                  'Room',
                  'Customer',
                  'Timer Type',
                  'Elapsed',
                  'Controllers',
                  'Products Count',
                  'Bill (EGP)',
                  'Actions',
                ].map((h) => (
                  <th
                    key={`th-${h}`}
                    className="text-left text-xs font-semibold text-muted-foreground pb-2.5 pr-4 last:pr-0"
                  >
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const elapsedSec = session.elapsedSeconds;
                const isOvertime =
                  !session.isOpenEnded &&
                  session.durationMinutes &&
                  elapsedSec > session.durationMinutes * 60;

                return (
                  <tr
                    key={session.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{session.room}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[session.roomType]}`}
                        >
                          {t(session.roomType)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-foreground">{session.customer}</p>
                      <p className="text-xs text-muted-foreground font-mono">{session.phone}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-foreground font-semibold">
                        {session.isOpenEnded
                          ? t('Open-Ended')
                          : `${t('Fixed')} (${session.durationMinutes}m)`}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div
                        className={`flex items-center gap-1 ${isOvertime ? 'text-danger' : 'text-accent'}`}
                      >
                        <Clock
                          size={12}
                          className={
                            isOvertime ? 'text-danger animate-pulse' : 'session-timer-pulse'
                          }
                        />
                        <span className="font-tabular text-sm font-semibold">
                          {formatElapsed(elapsedSec)}
                        </span>
                      </div>
                      {isOvertime && (
                        <p className="text-[10px] text-danger font-bold uppercase">
                          {t('Overtime')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        {session.controllers.map((c) => (
                          <span
                            key={c}
                            className="bg-secondary px-1 py-0.5 rounded text-[9px] font-mono text-secondary-foreground font-semibold border border-border"
                          >
                            {c.replace('Pad #', '#')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold font-tabular text-foreground">
                        {session.products.reduce((acc, p) => acc + p.qty, 0)} {t('items')}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold font-tabular text-foreground">
                        {session.runningBill.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">EGP</span>
                    </td>
                    <td className="py-3">
                      <Link href="/live-sessions">
                        <button className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded font-bold text-[10px]">
                          {t('MANAGE CARD')}
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
