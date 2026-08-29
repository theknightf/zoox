'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Gamepad2, Users, AlertCircle } from 'lucide-react';
import type { Reservation, ReservationStatus } from './ReservationsContent';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

interface DrawerFormData {
  customer: string;
  phone: string;
  room: string;
  game: string;
  players: number;
  date: string;
  time: string;
  duration: string;
  notes: string;
}

const rooms = [
  { id: 'room-001', name: 'Room 1', type: 'Standard', capacity: 2 },
  { id: 'room-002', name: 'Room 2', type: 'Standard', capacity: 4 },
  { id: 'room-003', name: 'Room 3', type: 'Premium', capacity: 4 },
  { id: 'room-004', name: 'Room 4', type: 'VIP', capacity: 6 },
  { id: 'room-005', name: 'Room 5', type: 'Standard', capacity: 2 },
  { id: 'room-006', name: 'Room 6', type: 'Premium', capacity: 4 },
  { id: 'room-007', name: 'Room 7', type: 'Standard', capacity: 2 },
  { id: 'room-008', name: 'Room 8', type: 'VIP', capacity: 8 },
];

const games = [
  'FC 26',
  'GTA V',
  'Call of Duty',
  'PES 2024',
  'Mortal Kombat 1',
  'WWE 2K25',
  'Spider-Man 2',
  'God of War',
];

const durationOptions = [
  { value: '', label: 'Open-ended (no limit)' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
];

interface ReservationDrawerProps {
  onClose: () => void;
  onSave: (res: Reservation) => void;
}

export default function ReservationDrawer({ onClose, onSave }: ReservationDrawerProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DrawerFormData>({
    defaultValues: {
      date: '2026-08-08',
      time: '16:00',
      players: 2,
      duration: '',
    },
  });

  const watchedPlayers = watch('players');
  const watchedRoom = watch('room');
  const watchedDuration = watch('duration');
  const roomObj = rooms.find((r) => r.name === watchedRoom);
  const capacityExceeded = roomObj && Number(watchedPlayers) > roomObj.capacity;

  const onSubmit = async (data: DrawerFormData) => {
    if (capacityExceeded) return;
    setIsLoading(true);
    // Backend integration point: POST /api/reservations with full reservation payload
    await new Promise((r) => setTimeout(r, 800));

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      customer: data.customer,
      phone: data.phone,
      room: data.room,
      roomType: (roomObj?.type as Reservation['roomType']) || 'Standard',
      game: data.game,
      players: Number(data.players),
      date: data.date,
      time: data.time,
      duration: data.duration || null,
      status: 'Reserved' as ReservationStatus,
      sessionType: data.duration ? 'fixed' : 'open',
      notes: data.notes,
      createdBy: 'staff',
      customerStatus: 'New',
    };

    onSave(newRes);
    toast.success(`${t('Reservation created for')} ${data.customer}`);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-card border-l border-border h-full overflow-y-auto scrollbar-thin slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-foreground">{t('New Reservation')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('Fill in the booking details below')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Customer info */}
          <div className="space-y-4">
            <p className="section-label">{t('Customer Information')}</p>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('Customer Name')} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.customer ? 'border-danger' : ''}`}
                placeholder={t('Full name')}
                {...register('customer', { required: t('Customer name is required') })}
              />
              {errors.customer && (
                <p className="text-xs text-danger mt-1">{errors.customer.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('Phone Number')} <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                {t('Used for reminders and notifications')}
              </p>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-danger' : ''}`}
                placeholder={t('01xxxxxxxxx')}
                {...register('phone', {
                  required: t('Phone number is required'),
                  pattern: {
                    value: /^01[0-9]{9}$/,
                    message: t('Enter a valid Egyptian mobile number (01xxxxxxxxx)'),
                  },
                })}
              />
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Booking details */}
          <div className="space-y-4 pt-2 border-t border-border">
            <p className="section-label pt-2">{t('Booking Details')}</p>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('Room')} <span className="text-danger">*</span>
              </label>
              <select
                className={`input-field ${errors.room ? 'border-danger' : ''}`}
                {...register('room', { required: t('Room selection is required') })}
                onChange={(e) => {
                  setSelectedRoom(rooms.find((r) => r.name === e.target.value) || null);
                }}
              >
                <option value="">{t('Select a room')}</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} — {t(r.type)} (max {r.capacity} {t('players')})
                  </option>
                ))}
              </select>
              {errors.room && <p className="text-xs text-danger mt-1">{errors.room.message}</p>}
              {selectedRoom && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t(selectedRoom.type)} {t('room')} · {t('maximum capacity')}:{' '}
                  {selectedRoom.capacity} {t('players')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <Gamepad2 size={13} className="inline mr-1" />
                {t('Game')} <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                {t('Only games available in the selected room will be valid')}
              </p>
              <select
                className={`input-field ${errors.game ? 'border-danger' : ''}`}
                {...register('game', { required: t('Game selection is required') })}
              >
                <option value="">{t('Select a game')}</option>
                {games.map((g) => (
                  <option key={`game-${g}`} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.game && <p className="text-xs text-danger mt-1">{errors.game.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <Users size={13} className="inline mr-1" />
                {t('Number of Players')} <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={8}
                className={`input-field ${errors.players || capacityExceeded ? 'border-danger' : ''}`}
                {...register('players', {
                  required: t('Number of players is required'),
                  min: { value: 1, message: t('At least 1 player required') },
                  max: { value: 8, message: t('Maximum 8 players per session') },
                })}
              />
              {errors.players && (
                <p className="text-xs text-danger mt-1">{errors.players.message}</p>
              )}
              {capacityExceeded && (
                <div className="flex items-center gap-1.5 mt-1.5 p-2 bg-danger/10 border border-danger/20 rounded-lg">
                  <AlertCircle size={12} className="text-danger flex-shrink-0" />
                  <p className="text-xs text-danger">
                    {t('Exceeds room capacity')} ({roomObj?.capacity} {t('max')}).{' '}
                    {t('Choose a larger room or reduce players.')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4 pt-2 border-t border-border">
            <p className="section-label pt-2">{t('Schedule')}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  <Calendar size={13} className="inline mr-1" />
                  {t('Date')} <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`input-field ${errors.date ? 'border-danger' : ''}`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && <p className="text-xs text-danger mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t('Start Time')} <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className={`input-field ${errors.time ? 'border-danger' : ''}`}
                  {...register('time', { required: 'Start time is required' })}
                />
                {errors.time && <p className="text-xs text-danger mt-1">{errors.time.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('Session Duration')}
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                {t('Leave empty for an open-ended session — billed by actual time played')}
              </p>
              <select className="input-field" {...register('duration')}>
                {durationOptions.map((opt) => (
                  <option key={`dur-${opt.value || 'open'}`} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
              {watchedDuration ? (
                <p className="text-xs text-info mt-1.5">
                  {t('Fixed session —')} {watchedDuration}{' '}
                  {t('minutes. Customer will be notified 10 minutes before end.')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {t('Open-ended session — staff ends manually and bills actual time.')}
                </p>
              )}
            </div>
          </div>

          {/* Grace period info */}
          <div className="p-3 bg-warning/5 border border-warning/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle size={13} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-warning">{t('Grace Period Policy')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    'Customer has a 10-minute grace period after the reserved start time. After that, the system will flag the reservation as Late or No Show based on center settings.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-2 border-t border-border">
            <p className="section-label pt-2 mb-3">{t('Additional Notes')}</p>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('Notes (optional)')}
              </label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder={t('Special requests, customer preferences, VIP notes...')}
                {...register('notes')}
              />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card border-t border-border -mx-5 px-5 py-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !!capacityExceeded}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                t('Create Reservation')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
