'use client';
import React, { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Gamepad2, Users, Clock, Zap, Tv2, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { LiveSession } from '@/types';

type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
type RoomType = 'Standard' | 'Premium' | 'VIP';

const STATIONS = [
  { id: 'st-1', name: 'Room VIP-1', type: 'VIP', console: 'PS5 PRO', rate: 150 },
  { id: 'st-2', name: 'Room VIP-2', type: 'VIP', console: 'PS5 PRO', rate: 150 },
  { id: 'st-3', name: 'Room 3', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-4', name: 'Room 4', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-5', name: 'Room 5', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-6', name: 'Room 6', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-7', name: 'Room 7', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-8', name: 'Room 8', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-9', name: 'Room 9', type: 'Standard', console: 'PS5 Standard', rate: 80 },
  { id: 'st-10', name: 'Room 10', type: 'Standard', console: 'PS5 Standard', rate: 80 },
  { id: 'st-11', name: 'Room 11', type: 'Standard', console: 'PS4 Pro', rate: 60 },
  { id: 'st-12', name: 'Room 12', type: 'Standard', console: 'PS4 Pro', rate: 60 },
] as const;

const statusConfig: Record<
  RoomStatus,
  { label: string; bg: string; text: string; dot: string; cardClass: string }
> = {
  available: {
    label: 'Available',
    bg: 'bg-success/10',
    text: 'text-[#00FFA3]',
    dot: 'bg-[#00FFA3]',
    cardClass: 'room-available-bg',
  },
  occupied: {
    label: 'Occupied',
    bg: 'bg-danger/10',
    text: 'text-danger',
    dot: 'bg-danger',
    cardClass: 'room-occupied-bg',
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
    cardClass: 'room-reserved-bg',
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    cardClass: 'room-maintenance-bg',
  },
};

function formatElapsedSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function RoomStatusGrid() {
  const { t } = useTranslation();
  const { sessions, reservations } = useApp();
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

  const resolvedRooms = STATIONS.map((station) => {
    // Find active session
    const activeSession = sessions.find((s) => s.room === station.name);

    // Find matching pending reservation
    const hasReservation = reservations.some(
      (r) => r.roomType === station.type && r.status === 'Pending'
    );

    let status: RoomStatus = 'available';
    if (activeSession) {
      status = 'occupied';
    } else if (hasReservation) {
      status = 'reserved';
    }

    // Hardcode room 11 as maintenance as a fallback mock warning
    if (station.name === 'Room 11') {
      status = 'maintenance';
    }

    return {
      id: station.id,
      name: station.name,
      type: station.type,
      console: station.console,
      rate: station.rate,
      status,
      session: activeSession,
    };
  });

  const filtered =
    filter === 'all' ? resolvedRooms : resolvedRooms.filter((r) => r.status === filter);

  const counts = {
    all: resolvedRooms.length,
    available: resolvedRooms.filter((r) => r.status === 'available').length,
    occupied: resolvedRooms.filter((r) => r.status === 'occupied').length,
    reserved: resolvedRooms.filter((r) => r.status === 'reserved').length,
    maintenance: resolvedRooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <div className="card-base p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t('Station Network Monitor')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('Live overview of all')} {resolvedRooms.length} {t('gaming stations')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'available', 'occupied', 'reserved', 'maintenance'] as const).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1))} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((room) => {
          const cfg = statusConfig[room.status];
          return (
            <div
              key={room.id}
              className={`border border-border/80 rounded-xl p-3.5 flex flex-col justify-between h-[125px] transition-all duration-150 ${cfg.cardClass} hover:border-primary/20`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground">{room.name}</h3>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block mt-0.5">
                    {room.console} • {t(room.type)}
                  </span>
                </div>
                <span className={`status-badge text-[9px] font-bold ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                  {t(cfg.label)}
                </span>
              </div>

              {room.status === 'occupied' && room.session ? (
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <div>
                    <p className="font-semibold text-foreground truncate max-w-[90px]">
                      {room.session.customer}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono leading-none">
                      {room.session.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#00FFA3] flex items-center gap-1">
                      <Clock size={10} className="animate-pulse" />
                      {formatElapsedSeconds(room.session.elapsedSeconds)}
                    </span>
                    <span className="text-[9px] text-muted-foreground block leading-none">
                      {room.session.runningBill} EGP
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>{t('Base Rate')}</span>
                  <span className="font-bold text-foreground">{room.rate} EGP/hr</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
