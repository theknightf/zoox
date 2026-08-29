'use client';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  ShieldAlert,
  Award,
  PlayCircle,
  Plus,
  CheckCircle,
  RefreshCcw,
  UserMinus,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

export type ReservationStatus =
  | 'Confirmed'
  | 'Pending'
  | 'No-Show'
  | 'Arrived'
  | 'Active'
  | 'Completed'
  | 'Cancelled'
  | 'Waiting'
  | 'Late'
  | 'Reserved'
  | 'No Show';

export interface Reservation {
  id: string;
  customer: string;
  phone: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  game: string;
  players: number;
  date: string;
  time: string;
  duration: string | null;
  status: ReservationStatus;
  sessionType: 'open' | 'fixed';
  notes?: string;
  createdBy: 'staff' | 'customer';
  customerStatus: 'New' | 'Regular' | 'Loyal' | 'VIP' | 'Low Reliability';
}

export default function ReservationsContent() {
  const { t } = useTranslation();
  const { reservations, waitingList, assignRoomFromWaitlist, currentRole, sessions, addSession } =
    useApp();

  const [localReservations, setLocalReservations] = useState(reservations);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmId, setShowConfirmId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  const handleConfirmReservation = (id: string) => {
    // Save confirmation
    setLocalReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Confirmed' as const } : r))
    );
    setShowConfirmId(null);
    toast.success(t('Reservation confirmed successfully.'));
  };

  const triggerConfirmAction = (res: (typeof reservations)[0]) => {
    if (res.previousNoShowFlag) {
      setShowConfirmId(res.id);
    } else {
      setLocalReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: 'Confirmed' as const } : r))
      );
      toast.success(t('Reservation confirmed.'));
    }
  };

  const handleNoShow = (id: string) => {
    setLocalReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'No-Show' as const } : r))
    );
    toast.error(t('Reservation marked as No-Show.'));
  };

  const filteredReservations = localReservations.filter((res) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      res.customerName.toLowerCase().includes(q) ||
      res.customerPhone.includes(q) ||
      res.roomType.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('Reservations & Live Waiting List')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t(
              'Approve bookings, monitor customer reliability scores, and allocate rooms to walk-in waiting lists.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Active Reservations Table */}
          <div className="xl:col-span-2 card-base p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t('Booking Schedule')}
              </h2>
              <input
                type="text"
                placeholder={t('Search by customer name or phone...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field max-w-xs py-1.5 text-xs"
              />
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold">
                    <th className="py-2.5 px-2">{t('Customer')}</th>
                    <th className="py-2.5 px-2">{t('Phone')}</th>
                    <th className="py-2.5 px-2">{t('Time')}</th>
                    <th className="py-2.5 px-2">{t('Room Type')}</th>
                    <th className="py-2.5 px-2">{t('Reliability')}</th>
                    <th className="py-2.5 px-2">{t('Status')}</th>
                    <th className="py-2.5 px-2 text-right">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-muted/10">
                      <td className="py-3 px-2">
                        <p className="font-bold text-foreground">{res.customerName}</p>
                        {res.customerHistoryNotes && (
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[200px]">
                            {res.customerHistoryNotes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-muted-foreground whitespace-nowrap">
                        {res.customerPhone}
                      </td>
                      <td className="py-3 px-2 font-semibold text-foreground whitespace-nowrap">
                        {res.dateTime.split('T')[1].substring(0, 5)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.roomType === 'VIP'
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : res.roomType === 'Premium'
                                ? 'bg-info/10 text-info border border-info/20'
                                : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {t(res.roomType)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {res.previousNoShowFlag ? (
                          <span className="bg-danger/10 border border-danger/20 text-danger text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-max">
                            <ShieldAlert size={10} />
                            {t('LOW RELIABILITY')}
                          </span>
                        ) : (
                          <span className="bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-max">
                            <Award size={10} />
                            {t('EXCELLENT')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            res.status === 'Confirmed'
                              ? 'bg-accent/10 border-accent/20 text-accent'
                              : res.status === 'No-Show'
                                ? 'bg-danger/10 border-danger/20 text-danger'
                                : 'bg-warning/10 border-warning/20 text-warning animate-pulse'
                          }`}
                        >
                          {t(res.status)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                        {res.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => triggerConfirmAction(res)}
                              className="px-2.5 py-1 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 rounded font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              <CheckCircle size={10} />
                              {t('Confirm')}
                            </button>
                            <button
                              onClick={() => handleNoShow(res.id)}
                              className="px-2.5 py-1 bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 rounded font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              <UserMinus size={10} />
                              {t('No-Show')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Waiting List Queue */}
          <div className="card-base p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('Waiting List Queue')}
            </h2>

            <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
              {waitingList.map((wl) => (
                <div
                  key={wl.id}
                  className="bg-muted/30 border border-border/40 rounded-xl p-3.5 space-y-3.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-foreground">{wl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{wl.phone}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-warning/20 bg-warning/10 text-warning">
                      {t(wl.roomType)} {t('Tier')}
                    </span>
                  </div>

                  {wl.note && (
                    <p className="text-[10px] italic text-muted-foreground">
                      {t('Notes:')} {wl.note}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssignTarget(wl)}
                      className="w-full py-1.5 bg-warning/10 hover:bg-warning/20 border border-warning/30 text-warning text-[10px] font-extrabold rounded-md flex items-center justify-center gap-1"
                    >
                      <PlayCircle size={12} />
                      {t('ASSIGN ROOM NOW')}
                    </button>
                  </div>
                </div>
              ))}

              {waitingList.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  {t('Waiting list is currently empty.')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No-Show Alert Approval modal */}
      {showConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm shadow-2xl z-10 space-y-4">
            <div className="flex items-start gap-2.5 text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">
              <AlertTriangle size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {t('No-Show Reliability Alert')}
                </h3>
                <p className="text-[11px] text-danger-foreground/90 mt-1 leading-snug">
                  {t(
                    'This customer has missed previous reservations without notifying the staff. Are you sure you want to approve this booking slot?'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowConfirmId(null)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                {t('Go Back')}
              </button>
              <button
                onClick={() => handleConfirmReservation(showConfirmId)}
                className="btn-primary bg-danger border-danger hover:opacity-90 flex-1 py-2 text-xs text-white"
              >
                {t('Force Approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setAssignTarget(null)} />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm shadow-2xl z-10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('Assign Room to')} {assignTarget.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('Select an available room to check them in.')}
              </p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                {t('Available Rooms')}
              </label>
              <select
                className="input-field"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">{t('-- Choose Room --')}</option>
                {[
                  'Room VIP-1',
                  'Room VIP-2',
                  'Room 3',
                  'Room 4',
                  'Room 5',
                  'Room 6',
                  'Room 7',
                  'Room 8',
                  'Room 9',
                  'Room 10',
                  'Room 11',
                  'Room 12',
                ]
                  .filter((r) => !sessions.map((s) => s.room).includes(r))
                  .map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setAssignTarget(null);
                  setSelectedRoom('');
                }}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedRoom) {
                    toast.error(t('Please select a room.'));
                    return;
                  }
                  assignRoomFromWaitlist(assignTarget.id, selectedRoom);
                  addSession({
                    room: selectedRoom,
                    roomType: assignTarget.roomType,
                    consoleTier: selectedRoom.includes('VIP') ? 'PS5 PRO' : 'PS5 Standard',
                    customer: assignTarget.name,
                    phone: assignTarget.phone,
                    openingStaff: 'Omar M.',
                    startTime: new Date().toLocaleTimeString('en-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    }),
                    isOpenEnded: true,
                    hourlyRate: selectedRoom.includes('VIP') ? 150 : 80,
                    controllers: ['Pad #1', 'Pad #2'],
                  });
                  toast.success(
                    `${t('Successfully assigned')} ${selectedRoom} ${t('to')} ${assignTarget.name}!`
                  );
                  setAssignTarget(null);
                  setSelectedRoom('');
                }}
                className="btn-primary bg-primary flex-1 py-2 text-xs text-white"
              >
                {t('Assign & Start Play')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
