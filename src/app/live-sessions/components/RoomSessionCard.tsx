'use client';
import React, { useState } from 'react';
import { Clock, ShoppingCart, Play, Gamepad2, CheckCircle2, User, Receipt } from 'lucide-react';
import type { LiveSession } from '@/types';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';

interface RoomSessionCardProps {
  stationName: string;
  stationType: 'Standard' | 'Premium' | 'VIP';
  consoleTier: string;
  baseRate: number;
  session?: LiveSession;
  onAddDrinks: (session: LiveSession) => void;
  onEndSession: (session: LiveSession) => void;
}

export default function RoomSessionCard({
  stationName,
  stationType,
  consoleTier,
  baseRate,
  session,
  onAddDrinks,
  onEndSession,
}: RoomSessionCardProps) {
  const { addSession, extendSession } = useApp();
  const { t } = useTranslation();
  const [localSeconds, setLocalSeconds] = useState(session?.elapsedSeconds || 0);

  React.useEffect(() => {
    if (session) {
      setLocalSeconds(session.elapsedSeconds);
    }
  }, [session?.elapsedSeconds]);

  React.useEffect(() => {
    if (!session || session.status !== 'active') return;
    const interval = setInterval(() => {
      setLocalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  const handleQuickBoot = (fixedMinutes?: number) => {
    addSession({
      room: stationName,
      roomType: stationType,
      consoleTier,
      customer: t('Walk-in'),
      phone: 'N/A',
      openingStaff: 'Omar M.',
      startTime: new Date().toLocaleTimeString('en-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      isOpenEnded: !fixedMinutes,
      durationMinutes: fixedMinutes,
      hourlyRate: baseRate,
      controllers: ['Pad #1', 'Pad #2'],
    });
    toast.success(t('Station ') + stationName + t(' booted!'));
  };

  const handleExtend30 = () => {
    if (!session) return;
    extendSession(session.id, 30);
    toast.success(t('Added 30 minutes.'));
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isVacant = !session;

  const getRunningBill = (elapsedSecs: number) => {
    if (!session) return 0;
    let timeCost = 0;
    for (let i = 0; i < session.modeHistory.length; i++) {
      const currentItem = session.modeHistory[i];
      const startTimeVal = new Date(currentItem.timestamp).getTime();
      const endTimeVal =
        i + 1 < session.modeHistory.length
          ? new Date(session.modeHistory[i + 1].timestamp).getTime()
          : Date.now();

      const durationHrs = Math.max(0, endTimeVal - startTimeVal) / (1000 * 3600);
      timeCost += durationHrs * currentItem.ratePerHour;
    }

    const durationSec = session.durationMinutes ? session.durationMinutes * 60 : 0;
    if (!session.isOpenEnded && session.durationMinutes) {
      const durationMin = durationSec / 60;
      const currentMin = elapsedSecs / 60;
      if (currentMin > durationMin) {
        const overtimeMins = currentMin - durationMin;
        const currentRate = session.modeHistory[session.modeHistory.length - 1].ratePerHour;
        const baseCost = (durationMin / 60) * session.modeHistory[0].ratePerHour;
        const overtimeCost = (overtimeMins / 60) * currentRate;
        timeCost = baseCost + overtimeCost;
      }
    }

    const productsCost = session.products.reduce((sum, p) => sum + p.price * p.qty, 0);
    return Math.round(timeCost + productsCost);
  };

  const currentBillVal = getRunningBill(localSeconds);

  if (isVacant) {
    // VACANT / AVAILABLE CARD STATE (Clean & Minimal)
    return (
      <div className="bg-[#131722] border border-[#1F293D] rounded-xl p-4 flex flex-col justify-between h-[265px] w-full transition-all duration-200 hover:border-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.03)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F293D]/60 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-sm font-bold text-white whitespace-nowrap">{stationName}</h4>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-[#8A2BE2]/10 text-[#8B5CF6] border border-[#8A2BE2]/20 uppercase rounded-md tracking-wider">
              {consoleTier}
            </span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00FFA3] border border-emerald-500/20 text-[9px] font-extrabold tracking-wider flex-shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            {t('Available')}
          </span>
        </div>

        {/* Center: Clean Rate Display */}
        <div className="flex flex-col items-center justify-center flex-grow py-3 text-center">
          <Gamepad2 size={24} className="text-[#1F293D] mb-1" />
          <span className="text-xl font-black text-white tracking-wide">
            {baseRate} <span className="text-xs font-semibold text-muted-foreground">EGP/hr</span>
          </span>
        </div>

        {/* Footer actions: 2 instant action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1F293D]/60">
          <button
            onClick={() => handleQuickBoot()}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#00FFA3] bg-[#00FFA3]/5 border border-[#00FFA3]/20 rounded-lg hover:bg-[#00FFA3]/15 transition-all duration-150 h-10"
          >
            <Play size={11} fill="currentColor" />
            {t('Open Session')}
          </button>
          <button
            onClick={() => handleQuickBoot(60)}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-300 bg-slate-800/10 border border-slate-700/30 rounded-lg hover:bg-slate-800/25 transition-all duration-150 h-10"
          >
            <Clock size={11} />
            {t('+1 Hour')}
          </button>
        </div>
      </div>
    );
  }

  // OCCUPIED / ACTIVE CARD STATE
  const activeSession = session!;
  const elapsed = localSeconds;
  const durationSec = activeSession.durationMinutes ? activeSession.durationMinutes * 60 : 0;
  const isOvertime = !activeSession.isOpenEnded && durationSec > 0 && elapsed > durationSec;
  const overtimeSec = isOvertime ? elapsed - durationSec : 0;

  return (
    <div
      className={`bg-[#131722] border rounded-xl p-4 flex flex-col justify-between h-[265px] w-full transition-all duration-200 ${
        isOvertime
          ? 'border-[#FFB800]/50 shadow-[0_0_10px_rgba(255,184,0,0.1)]'
          : 'border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.08)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F293D]/60 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="text-sm font-bold text-white whitespace-nowrap">{stationName}</h4>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-[#8A2BE2]/10 text-[#8B5CF6] border border-[#8A2BE2]/20 uppercase rounded-md tracking-wider">
            {consoleTier}
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider border flex-shrink-0 whitespace-nowrap ${
            isOvertime
              ? 'bg-amber-500/10 text-[#FFB800] border-amber-500/20'
              : 'bg-emerald-500/10 text-[#00FFA3] border-emerald-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full bg-current ${!isOvertime ? 'animate-pulse' : ''}`}
          />
          {t('Occupied')}
        </span>
      </div>

      {/* Timer & Cost Strip */}
      <div className="flex items-center justify-between py-2 border-b border-[#1F293D]/30">
        <span
          className={`font-mono text-lg font-black tracking-widest ${isOvertime ? 'text-[#FFB800]' : 'text-[#00FFA3]'}`}
        >
          {isOvertime ? `+${formatTime(overtimeSec)}` : formatTime(elapsed)}
        </span>
        <span className="text-sm font-black text-white bg-slate-800/40 px-2 py-0.5 rounded border border-[#1F293D]/40 font-mono">
          {currentBillVal} EGP
        </span>
      </div>

      {/* Customer Info (Single inline line) */}
      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold py-1.5 flex-grow">
        <span className="text-muted-foreground">👤</span>
        <span className="flex-wrap break-all">
          {activeSession.customer} • {activeSession.controllers.length} {t('Players')}
        </span>
      </div>

      {/* Action Bar (Compact 1-Row Grid Layout) */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1F293D]/60">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleExtend30}
            className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-[#8A2BE2] bg-[#8A2BE2]/5 border border-[#8A2BE2]/20 rounded-lg hover:bg-[#8A2BE2]/15 transition-all duration-150 h-8"
          >
            <Clock size={10} />
            {t('+30m')}
          </button>
          <button
            onClick={() => onAddDrinks(activeSession)}
            className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg hover:bg-[#00E5FF]/15 transition-all duration-150 h-8"
          >
            <ShoppingCart size={10} />
            {t('+Drinks')}
          </button>
        </div>
        <button
          onClick={() => onEndSession(activeSession)}
          className="w-full bg-[#E11D48]/10 hover:bg-[#E11D48]/20 border border-[#E11D48]/30 text-[#E11D48] py-1.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all duration-150 h-8"
        >
          <Receipt size={10} />
          {t('Settle / End')}
        </button>
      </div>
    </div>
  );
}
