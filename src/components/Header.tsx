'use client';
import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useReservationSocket } from '@/hooks/useReservationSocket';
import { useTranslation } from '@/i18n';
import CafeReceipt from '@/components/CafeReceipt';
import {
  Gamepad2,
  Users,
  Settings,
  AlertOctagon,
  Clock,
  DollarSign,
  FolderOpen,
  X,
  Coffee,
  ArrowRightLeft,
  Bell,
  CheckCircle,
  PhoneCall,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

// Helper: format seconds → HH:MM:SS display
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header() {
  const {
    currentRole,
    language,
    sessions,
    waitingList,
    controllers,
    products,
    auditLogs,
    cafeTables,
    openCafeTable,
    addItemToTable,
    removeItemFromTable,
    reserveCafeTable,
    settleTable,
    transferTableToSession,
    upcomingAlerts,
    dismissReservationAlert,
    snoozeReservationAlert,
    checkInFromAlert,
    assignRoomFromWaitlist,
    logFoundItem,
    updateControllerStatus,
  } = useApp();
  const { t } = useTranslation();

  const [receiptData, setReceiptData] = useState<{
    tableName: string;
    items: { id: string; name: string; price: number; qty: number }[];
    paymentMethod: string;
    discount: number;
    customerName?: string;
  } | null>(null);
  const [activeModal, setActiveModal] = useState<
    'assign' | 'billiards' | 'cafe' | 'hardware' | 'lost' | null
  >(null);
  const [selectedWaitlistId, setSelectedWaitlistId] = useState('');
  const [assignRoomName, setAssignRoomName] = useState('');
  const [billiards, setBilliards] = useState([
    { id: 'b-1', name: 'Billiards Table 1', status: 'available', elapsedSeconds: 0 },
    { id: 'b-2', name: 'Billiards Table 2', status: 'available', elapsedSeconds: 0 },
  ]);
  const [selectedCafeTableId, setSelectedCafeTableId] = useState<string | null>(null);
  const [transferTargetRoomId, setTransferTargetRoomId] = useState('');
  const [cafePaymentMethod, setCafePaymentMethod] = useState<'Cash' | 'Card' | 'Vodafone Cash'>(
    'Cash'
  );
  const [cafeDiscount, setCafeDiscount] = useState(0);
  const [reportCtrlId, setReportCtrlId] = useState('Pad #1');
  const [reportIssue, setReportIssue] = useState<
    'Stick Drift' | 'Broken Buttons' | 'Under Repair / Checkup'
  >('Stick Drift');
  const [lostRoom, setLostRoom] = useState('Room VIP-1');
  const [lostDesc, setLostDesc] = useState('');

  const ROOMS_LIST = [
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
  ];
  const activeMatch = sessions.find((s) => s.room === lostRoom);
  const suggestedName = activeMatch?.customer || 'Mohamed Khalil';
  const suggestedPhone = activeMatch?.phone || '0100-123-4521';

  useReservationSocket((payload) => {
    toast(
      `📅 ${t('Upcoming:')} ${payload.customerName} ${t('in')} ${payload.minutesAway} ${t('min')}`,
      { duration: 6000 }
    );
  });

  const handleWaitlistAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaitlistId || !assignRoomName) {
      toast.error(t('Select customer and room.'));
      return;
    }
    assignRoomFromWaitlist(selectedWaitlistId, assignRoomName);
    toast.success(`${t('Assigned')} ${t(assignRoomName)}!`);
    setActiveModal(null);
    setSelectedWaitlistId('');
    setAssignRoomName('');
  };

  const handleSettleTable = (tableId: string) => {
    const table = cafeTables.find((t) => t.id === tableId);
    if (!table || !table.items.length) {
      toast.error(t('No items on this table.'));
      return;
    }
    const result = settleTable(tableId, cafePaymentMethod, cafeDiscount);
    setReceiptData({
      tableName: result.tableName,
      items: result.items,
      paymentMethod: cafePaymentMethod,
      discount: cafeDiscount,
      customerName: table.customerName,
    });
    toast.success(`${t('Settled! Total:')} ${result.total} ${t('EGP')}`);
    setTimeout(() => window.print(), 200);
    setSelectedCafeTableId(null);
    setCafeDiscount(0);
  };

  const handleTransfer = (tableId: string) => {
    if (!transferTargetRoomId) {
      toast.error(t('Select a PS session.'));
      return;
    }
    transferTableToSession(tableId, transferTargetRoomId);
    toast.success(t('Order transferred.'));
    setTransferTargetRoomId('');
    setSelectedCafeTableId(null);
  };

  const selectedTable = cafeTables.find((t) => t.id === selectedCafeTableId);
  const activeAlert = upcomingAlerts.find((a) => !a.snoozedUntil || a.snoozedUntil <= Date.now());
  const occupiedCafeTables = cafeTables.filter((t) => t.status === 'Occupied').length;

  return (
    <div className="bg-[#0B0F19] border-b border-[#1F293D]/60 px-4 py-3 sticky top-0 z-40">
      {receiptData && (
        <CafeReceipt
          tableName={receiptData.tableName}
          items={receiptData.items}
          paymentMethod={receiptData.paymentMethod}
          discount={receiptData.discount}
          customerName={receiptData.customerName}
        />
      )}

      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary">
            <Settings size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{t('Zoox Hub Operations')}</h2>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
              {currentRole === 'owner' ? t('Owner Dashboard') : t('Staff Panel')}
            </span>
          </div>
        </div>

        {currentRole === 'owner' && (
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-1.5">
              <Gamepad2 size={13} className="text-[#00FFA3]" />
              <span className="text-white font-mono">
                {sessions.length} / 12 {t('Rooms')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-1.5">
              <DollarSign size={13} className="text-[#8B5CF6]" />
              <span className="text-white font-mono">
                {sessions.reduce((s, x) => s + x.runningBill, 0)} {t('EGP')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#131722] border border-[#1F293D] rounded-xl px-3 py-1.5">
              <Coffee size={13} className="text-[#00FFA3]" />
              <span className="text-white font-mono">
                {occupiedCafeTables} / 15 {t('Café')}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {}}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-warning/35 text-xs font-bold text-foreground"
          >
            <Bell
              size={12}
              className={
                upcomingAlerts.length > 0 ? 'text-warning animate-pulse' : 'text-muted-foreground'
              }
            />{' '}
            {t('Alerts')}
            {upcomingAlerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-warning text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {upcomingAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveModal('assign')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-warning/35 text-xs font-bold text-foreground"
          >
            <Users size={12} className="text-warning" /> {t('Waitlist')}
            {waitingList.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-warning text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {waitingList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveModal('billiards')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-primary/35 text-xs font-bold text-foreground"
          >
            <Timer size={12} className="text-primary" /> {t('Billiards')}
          </button>
          <button
            onClick={() => setActiveModal('cafe')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-[#00FFA3]/35 text-xs font-bold text-foreground"
          >
            <Coffee size={12} className="text-[#00FFA3]" /> {t('Café POS')}
            {occupiedCafeTables > 0 && (
              <span className="bg-[#00FFA3]/20 text-[#00FFA3] text-[9px] px-1.5 rounded font-black ml-1">
                {occupiedCafeTables}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveModal('hardware')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-[#FFB800]/35 text-xs font-bold text-foreground"
          >
            <AlertOctagon size={12} className="text-[#FFB800]" /> {t('Defects')}
          </button>
          <button
            onClick={() => setActiveModal('lost')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] border border-[#1F293D] rounded-xl hover:border-cyan-500/35 text-xs font-bold text-foreground"
          >
            <FolderOpen size={12} className="text-cyan-400" /> {t('Lost')}
          </button>
        </div>
      </div>

      {/* Waitlist Modal */}
      {activeModal === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setActiveModal(null)} />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm z-10 space-y-4 text-xs text-foreground shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase">{t('Quick Assign Room')}</h3>
            <form onSubmit={handleWaitlistAssign} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Customer')}
                </label>
                <select
                  className="input-field"
                  value={selectedWaitlistId}
                  onChange={(e) => setSelectedWaitlistId(e.target.value)}
                  required
                >
                  <option value="">{t('-- Select --')}</option>
                  {waitingList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({t(w.roomType)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Vacant Room')}
                </label>
                <select
                  className="input-field"
                  value={assignRoomName}
                  onChange={(e) => setAssignRoomName(e.target.value)}
                  required
                >
                  <option value="">{t('-- Choose --')}</option>
                  {ROOMS_LIST.filter((r) => !sessions.map((s) => s.room).includes(r)).map((r) => (
                    <option key={r} value={r}>
                      {t(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-secondary flex-1 py-2"
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary bg-primary flex-1 py-2 text-white">
                  {t('Assign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Billiards Modal */}
      {activeModal === 'billiards' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setActiveModal(null)} />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm z-10 space-y-4 text-xs text-foreground shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase">{t('Billiards Control')}</h3>
            <div className="space-y-2">
              {billiards.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-lg"
                >
                  <div>
                    <p className="font-bold text-white">{t(table.name)}</p>
                    <span
                      className={`text-[9px] font-bold uppercase ${table.status === 'active' ? 'text-[#00FFA3]' : 'text-muted-foreground'}`}
                    >
                      {table.status === 'active'
                        ? `⏱ ${formatDuration(table.elapsedSeconds)}`
                        : t('Idle')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setBilliards((prev) =>
                        prev.map((t) =>
                          t.id !== table.id
                            ? t
                            : {
                                ...t,
                                status: t.status === 'active' ? 'available' : 'active',
                                elapsedSeconds: 0,
                              }
                        )
                      );
                      toast.success(
                        `${t(table.name)} ${table.status === 'active' ? t('stopped') : t('started')}.`
                      );
                    }}
                    className={`px-3 py-1 rounded text-[10px] font-extrabold border ${table.status === 'active' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-accent/10 border-accent/30 text-accent'}`}
                  >
                    {table.status === 'active' ? t('Stop') : t('Start')}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="btn-secondary w-full py-2">
              {t('Close')}
            </button>
          </div>
        </div>
      )}

      {/* Café Table POS Modal */}
      {activeModal === 'cafe' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => {
              setActiveModal(null);
              setSelectedCafeTableId(null);
            }}
          />
          <div className="bg-card border border-[#1F293D] rounded-3xl w-full max-w-5xl p-6 shadow-2xl z-10 text-xs text-foreground max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase">
                  {t('Café Tables Service & POS')}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {occupiedCafeTables} {t('occupied')} ·{' '}
                  {cafeTables.filter((t) => t.status === 'Available').length} {t('available')} ·{' '}
                  {cafeTables.filter((t) => t.status === 'Reserved').length} {t('reserved')}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedCafeTableId(null);
                }}
                className="text-muted-foreground hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {!selectedTable ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {cafeTables.map((table) => {
                  const subtotal = table.items.reduce((s, i) => s + i.price * i.qty, 0);
                  return (
                    <div
                      key={table.id}
                      onClick={() => {
                        if (table.status === 'Available') openCafeTable(table.id);
                        setSelectedCafeTableId(table.id);
                      }}
                      className={`border rounded-xl p-3 h-[120px] flex flex-col justify-between cursor-pointer transition-all ${table.status === 'Occupied' ? 'bg-[#8A2BE2]/5 border-[#8A2BE2]/40 hover:border-[#8A2BE2]' : table.status === 'Reserved' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500' : 'bg-card border-border hover:border-border/60'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-[11px]">{t(table.name)}</span>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${table.status === 'Occupied' ? 'bg-[#00FFA3] animate-pulse' : table.status === 'Reserved' ? 'bg-amber-400' : 'bg-slate-600'}`}
                        />
                      </div>
                      <div className="text-[10px]">
                        {table.status === 'Occupied' ? (
                          <>
                            <p className="font-mono text-[#00FFA3] font-bold">{subtotal} EGP</p>
                            <p className="text-muted-foreground font-mono">
                              ⏱ {formatDuration(table.elapsedSeconds)}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted-foreground italic">{t(table.status)}</p>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/20">
                        {table.status === 'Available' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reserveCafeTable(table.id);
                              toast.success(t('Reservation toggled.'));
                            }}
                            className="text-[9px] font-bold text-amber-400 hover:underline"
                          >
                            {t('Reserve')}
                          </button>
                        )}
                        <span className="text-[9px] font-bold text-primary ml-auto">
                          {t('Manage →')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between pb-2 border-b border-border/20">
                    <span className="font-bold text-white">{t('Add Items')}</span>
                    <button
                      onClick={() => setSelectedCafeTableId(null)}
                      className="text-primary hover:underline text-[11px]"
                    >
                      ← {t('Tables')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          addItemToTable(selectedTable.id, {
                            id: p.id,
                            name: p.name,
                            price: p.sellingPrice,
                            qty: 1,
                          });
                          toast.success(`${t('Added')} ${p.name}`);
                        }}
                        className="bg-[#131722] border border-[#1F293D] rounded-xl p-3 flex flex-col items-center text-center hover:border-primary/45 h-[85px] justify-between transition-colors"
                      >
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-xs font-black text-[#00FFA3] font-mono">
                          {p.sellingPrice} {t('EGP')}
                        </span>
                        <span className="text-[9px] text-muted-foreground">Stock: {p.stock}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                  <div className="mb-2">
                    <span className="font-bold text-white text-sm">{t(selectedTable.name)}</span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      ⏱ {formatDuration(selectedTable.elapsedSeconds)}
                      {selectedTable.customerName ? ` · ${selectedTable.customerName}` : ''}
                    </p>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 flex-1">
                    {selectedTable.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-muted/20 border border-border/30 rounded-lg p-2"
                      >
                        <div>
                          <p className="font-bold text-white text-[11px]">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {item.price} × {item.qty} = {item.price * item.qty} {t('EGP')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromTable(selectedTable.id, item.id)}
                          className="text-danger hover:bg-danger/10 p-1 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {!selectedTable.items.length && (
                      <p className="text-xs text-muted-foreground italic text-center py-6">
                        No items yet.
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/10 p-2 rounded-xl space-y-1.5 border border-border/30 mt-3">
                    <label className="text-[9px] uppercase text-muted-foreground font-bold">
                      🔗 {t('Transfer to PS Session')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="input-field py-1 text-xs flex-1"
                        value={transferTargetRoomId}
                        onChange={(e) => setTransferTargetRoomId(e.target.value)}
                      >
                        <option value="">{t('-- Select --')}</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {t(s.room)} ({s.customer})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleTransfer(selectedTable.id)}
                        className="px-3 bg-primary text-white font-bold rounded-lg text-[11px] h-8 flex items-center gap-1"
                      >
                        <ArrowRightLeft size={11} /> Go
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#1F293D] mt-3">
                    {(() => {
                      const sub = selectedTable.items.reduce((s, i) => s + i.price * i.qty, 0);
                      const tax = Math.round(sub * 0.12);
                      const total = Math.max(0, sub + tax - cafeDiscount);
                      return (
                        <div className="text-[11px] space-y-0.5 text-slate-300 font-mono">
                          <div className="flex justify-between">
                            <span>{t('Subtotal:')}</span>
                            <span>
                              {sub} {t('EGP')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('Service (12%):')}</span>
                            <span>
                              {tax} {t('EGP')}
                            </span>
                          </div>
                          {cafeDiscount > 0 && (
                            <div className="flex justify-between text-warning">
                              <span>{t('Discount:')}</span>
                              <span>
                                -{cafeDiscount} {t('EGP')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-border/20">
                            <span>{t('TOTAL:')}</span>
                            <span className="text-[#00FFA3]">
                              {total} {t('EGP')}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex gap-2">
                      <select
                        className="input-field py-1.5 text-xs flex-1"
                        value={cafePaymentMethod}
                        onChange={(e) => setCafePaymentMethod(e.target.value as any)}
                      >
                        <option value="Cash">{t('Cash')}</option>
                        <option value="Card">{t('Card')}</option>
                        <option value="Vodafone Cash">{t('Vodafone Cash')}</option>
                      </select>
                      <input
                        type="number"
                        className="input-field py-1.5 text-xs w-20"
                        placeholder={t('Disc.')}
                        value={cafeDiscount || ''}
                        onChange={(e) => setCafeDiscount(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCafeTableId(null)}
                        className="btn-secondary flex-1 py-2 text-xs"
                      >
                        {t('Back')}
                      </button>
                      <button
                        onClick={() => handleSettleTable(selectedTable.id)}
                        disabled={!selectedTable.items.length}
                        className="btn-primary bg-[#00FFA3] hover:bg-[#00e5a3] text-black font-bold flex-1 py-2 text-xs disabled:opacity-50"
                      >
                        🖨 {t('Settle & Print')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hardware Modal */}
      {activeModal === 'hardware' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setActiveModal(null)} />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm z-10 space-y-4 text-xs text-foreground shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase">{t('Report Hardware Issue')}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateControllerStatus(reportCtrlId, reportIssue);
                toast.success(`${t('Logged')} ${t(reportIssue)} ${t('on')} ${t(reportCtrlId)}`);
                setActiveModal(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Device')}
                </label>
                <select
                  className="input-field"
                  value={reportCtrlId}
                  onChange={(e) => setReportCtrlId(e.target.value)}
                >
                  {controllers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} ({t(c.status)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Defect Type')}
                </label>
                <select
                  className="input-field"
                  value={reportIssue}
                  onChange={(e) => setReportIssue(e.target.value as any)}
                >
                  <option value="Stick Drift">{t('Stick Drift')}</option>
                  <option value="Broken Buttons">{t('Broken Buttons')}</option>
                  <option value="Under Repair / Checkup">{t('Under Repair / Checkup')}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-secondary flex-1 py-2"
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary bg-primary flex-1 py-2 text-white">
                  {t('Log Defect')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost & Found Modal */}
      {activeModal === 'lost' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setActiveModal(null)} />
          <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm z-10 space-y-4 text-xs text-foreground shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase">{t('Log Found Item')}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!lostDesc.trim()) {
                  toast.error(t('Describe the item.'));
                  return;
                }
                logFoundItem(lostRoom, lostDesc);
                setLostDesc('');
                toast.success(`${t('Logged. Suggested:')} ${suggestedName}`);
                setActiveModal(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Location')}
                </label>
                <select
                  className="input-field"
                  value={lostRoom}
                  onChange={(e) => setLostRoom(e.target.value)}
                >
                  {ROOMS_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                  {t('Description')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t('e.g. Silver watch')}
                  value={lostDesc}
                  onChange={(e) => setLostDesc(e.target.value)}
                  required
                />
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
                <span className="text-[9px] uppercase font-bold text-primary">
                  💡 {t('Last Active Guest')}
                </span>
                <p className="font-bold text-white">{suggestedName}</p>
                <p className="text-[10px] text-muted-foreground">{suggestedPhone}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-secondary flex-1 py-2"
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary bg-primary flex-1 py-2 text-white">
                  {t('Log Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Alert Popup */}
      {activeAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" />
          <div className="bg-card border border-[#FFB800]/40 p-5 rounded-2xl w-full max-w-sm shadow-[0_0_24px_rgba(255,184,0,0.2)] z-[61] space-y-4 text-xs text-foreground">
            <div className="flex items-center gap-2 text-warning font-bold">
              <Clock size={16} className="animate-pulse" />
              <span className="uppercase tracking-widest text-[10px]">
                ⏰ {t('Approaching —')} {activeAlert.minutesAway} {t('min away')}
              </span>
            </div>
            <div className="space-y-1.5 border-y border-border/40 py-3">
              <p className="text-sm font-bold text-white">{activeAlert.customerName}</p>
              <p className="text-muted-foreground">
                📞 <span className="font-mono text-white">{activeAlert.customerPhone}</span>
              </p>
              <p className="text-muted-foreground">
                🎮{' '}
                <span className="font-bold text-white">
                  {activeAlert.room || activeAlert.roomType}
                </span>
              </p>
              <p className="text-muted-foreground">
                ⌚ <span className="font-bold text-[#FFB800]">{activeAlert.scheduledTime}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  checkInFromAlert(activeAlert);
                  toast.success(`${activeAlert.customerName} ${t('checked in!')}`);
                }}
                className="btn-primary bg-primary flex items-center justify-center gap-1 py-2 text-xs text-white"
              >
                <CheckCircle size={12} /> {t('Check-in')}
              </button>
              <button
                onClick={() => toast.info(`${t('Calling')} ${activeAlert.customerPhone}…`)}
                className="btn-secondary flex items-center justify-center gap-1 py-2 text-xs"
              >
                <PhoneCall size={12} /> {t('Call')}
              </button>
              <button
                onClick={() => {
                  dismissReservationAlert(activeAlert.id);
                  toast.error(t('No-Show logged.'));
                }}
                className="btn-secondary text-danger border-danger/25 py-2 text-xs"
              >
                {t('No-Show')}
              </button>
              <button
                onClick={() => {
                  snoozeReservationAlert(activeAlert.id);
                  toast.info(t('Snoozed 5 min.'));
                }}
                className="btn-secondary py-2 text-xs"
              >
                {t('Snooze')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
