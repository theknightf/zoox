'use client';
import React from 'react';
import { useApp } from '@/context/AppContext';
import DashboardTopBar from './DashboardTopBar';
import QuickStatsRow from './QuickStatsRow';
import RoomStatusGrid from './RoomStatusGrid';
import ActiveSessionsList from './ActiveSessionsList';
import UpcomingReservationsPanel from './UpcomingReservationsPanel';
import WaitingListPanel from './WaitingListPanel';
import QuickActionsPanel from './QuickActionsPanel';
import {
  BookOpen, Star, PackageSearch, ShieldCheck, TrendingUp,
  DollarSign, Activity, Users, Clock, AlertTriangle, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function StaffDashboardContent() {
  const {
    currentRole,
    lostFoundItems,
    sessions,
    employees,
    attendanceRecords,
    shifts,
    cashTransactions,
    actionAlerts
  } = useApp();

  const isCustomer = currentRole === 'customer';
  const isOwnerOrManager = currentRole === 'owner' || currentRole === 'manager';

  // Live Calculations
  const activeShift = shifts.find(s => s.status === 'Active');
  const liveSessionsBilling = sessions.reduce((sum, s) => sum + s.runningBill, 0);
  const activeStaffCount = attendanceRecords.filter(r => !r.checkOutTime).length;
  const pendingApprovalsCount = actionAlerts.filter(a => !a.resolved && a.severity === 'Critical').length;

  if (isCustomer) {
    return (
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Zoox Hub!</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal gaming portal, loyalty points, and reservations manager.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-base p-5 bg-primary/5 border-primary/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                Loyalty Tier
              </span>
              <h3 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-1.5">
                <Star size={18} className="text-warning fill-warning" />
                Gold Elite Member
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Earn 10 points for every hour of play. Redeem for free drinks or game hours!
              </p>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Points Balance:</span>
              <span className="text-accent font-bold">420 Points</span>
            </div>
          </div>

          <div className="card-base p-5 bg-accent/5 border-accent/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-accent tracking-wider block">
                Book Next Play Session
              </span>
              <h3 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-1.5">
                <BookOpen size={18} className="text-accent" />
                Reserve Room
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Book your VIP PS5 Pro or Premium Couch in advance to guarantee a slot.
              </p>
            </div>
            <Link
              href="/reservations"
              className="btn-primary bg-accent hover:opacity-90 border-accent py-2 text-center text-xs text-white"
            >
              Go to Booking Screen
            </Link>
          </div>

          <div className="card-base p-5 bg-warning/5 border-warning/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-warning tracking-wider block">
                Claim Lost Property
              </span>
              <h3 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-1.5">
                <PackageSearch size={18} className="text-warning" />
                Lost &amp; Found Claims
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Did you leave something behind? Open a claim ticket so staff can set it aside.
              </p>
            </div>
            <Link
              href="/lost-found"
              className="btn-primary bg-warning hover:opacity-90 border-warning py-2 text-center text-xs text-white"
            >
              Log lost claim
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card-base p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Your Active Sessions
            </h3>
            {sessions.filter((s) => s.phone === '0100-123-4521').length > 0 ? (
              <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">
                    {sessions[0].room} ({sessions[0].roomType})
                  </span>
                  <span className="text-accent animate-pulse font-bold">Active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Console: {sessions[0].consoleTier}
                </p>
                <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-border">
                  <span>Current Bill:</span>
                  <span className="text-foreground">{sessions[0].runningBill} EGP</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                You currently do not have any active play sessions.
              </p>
            )}
          </div>

          <div className="card-base p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Your Claim Tickets
            </h3>
            <div className="space-y-2">
              {lostFoundItems
                .filter((i) => i.suggestedCustomerId === 'cust-1')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-muted/40 p-3 rounded-lg flex justify-between items-center border border-border/50 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Found in: {item.roomName}
                      </p>
                    </div>
                    <span
                      className={"px-2 py-0.5 rounded text-[9px] font-bold " + (item.status === 'Returned' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning')}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <DashboardTopBar />

      {/* Owner & Manager Profit Analytics Banners */}
      {isOwnerOrManager && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-base p-4 bg-purple-500/5 border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider block">
                Live Lounge Revenue
              </span>
              <span className="text-lg font-black text-white font-mono">{liveSessionsBilling.toLocaleString()} EGP</span>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                Billing accumulated from active rooms
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/25 text-purple-400">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="card-base p-4 bg-emerald-500/5 border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider block">
                Shift status
              </span>
              <span className="text-lg font-black text-white font-mono">
                {activeShift ? 'Shift Active' : 'No Active Shift'}
              </span>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                {activeShift ? 'Shift Float: ' + activeShift.openingCash + ' EGP' : 'Lounge closed'}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/25 text-emerald-400">
              <Clock size={20} />
            </div>
          </div>

          <div className="card-base p-4 bg-info/5 border-info/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-info tracking-wider block">
                Employees Present
              </span>
              <span className="text-lg font-black text-white font-mono">{activeStaffCount} present</span>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                Verified within Geofence range
              </p>
            </div>
            <div className="p-2.5 bg-info/10 rounded-xl border border-info/25 text-info">
              <Users size={20} />
            </div>
          </div>

          <div className="card-base p-4 bg-red-500/5 border-red-500/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider block">
                Critical Settle Alerts
              </span>
              <span className="text-lg font-black text-white font-mono">{pendingApprovalsCount} alerts</span>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                Cash differences / stock issues
              </p>
            </div>
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/25 text-red-400">
              <ShieldAlert size={20} />
            </div>
          </div>
        </div>
      )}

      <QuickStatsRow />

      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 2xl:col-span-3 space-y-6">
          <RoomStatusGrid />
          <ActiveSessionsList />
        </div>
        <div className="xl:col-span-1 2xl:col-span-1 space-y-4">
          <QuickActionsPanel />
          <UpcomingReservationsPanel />
          <WaitingListPanel />
        </div>
      </div>
    </div>
  );
}
