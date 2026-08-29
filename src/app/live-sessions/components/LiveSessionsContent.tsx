'use client';
import React, { useState, useEffect } from 'react';
import LiveSessionsHeader from './LiveSessionsHeader';
import SessionsGrid from './SessionsGrid';
import PaymentModal from './PaymentModal';
import EvaluationPopup from './EvaluationPopup';
import AddProductModal from './AddProductModal';
import { useApp } from '@/context/AppContext';
import type { LiveSession } from '@/types';
export type { LiveSession, SessionProduct } from '@/types';
import {
  Plus,
  X,
  UserCheck,
  Gamepad2,
  CupSoda,
  Percent,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

export default function LiveSessionsContent() {
  const { sessions, addSession, currentRole, products, addCafeOrder } = useApp();
  const { t } = useTranslation();
  const [paymentTarget, setPaymentTarget] = useState<LiveSession | null>(null);
  const [evaluationTarget, setEvaluationTarget] = useState<LiveSession | null>(null);
  const [addProductTarget, setAddProductTarget] = useState<LiveSession | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeZone, setActiveZone] = useState<'playstation' | 'billiards' | 'cafe'>('playstation');

  // Form states for starting new session
  const [roomName, setRoomName] = useState('Room VIP-2');
  const [roomType, setRoomType] = useState<'Standard' | 'Premium' | 'VIP'>('VIP');
  const [consoleTier, setConsoleTier] = useState('PS5 PRO');
  const [isOpenEnded, setIsOpenEnded] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [customerMode, setCustomerMode] = useState<'walkin' | 'registered' | 'newguest'>('walkin');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedRegisteredId, setSelectedRegisteredId] = useState('res-2');
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [controllers, setControllers] = useState<string[]>(['Pad #5', 'Pad #6']);

  // Billiards State
  const [billiardsTables, setBilliardsTables] = useState([
    {
      id: 'b-1',
      name: 'Billiards Table 1',
      type: 'Premium Pool',
      rate: 120,
      status: 'active',
      customer: 'Karim F.',
      elapsedSeconds: 2400,
    },
    {
      id: 'b-2',
      name: 'Billiards Table 2',
      type: 'Standard Snooker',
      rate: 100,
      status: 'available',
      customer: '',
      elapsedSeconds: 0,
    },
    {
      id: 'b-3',
      name: 'Billiards Table 3',
      type: 'Standard Snooker',
      rate: 100,
      status: 'available',
      customer: '',
      elapsedSeconds: 0,
    },
  ]);

  // Café Table Service (15 Tables) State
  const [cafeTables, setCafeTables] = useState(() => {
    const list = [];
    for (let i = 1; i <= 15; i++) {
      list.push({
        id: `ct-${i}`,
        name: `Café Table ${i}`,
        status: 'available',
        items: [] as { id: string; name: string; price: number; qty: number }[],
      });
    }
    return list;
  });

  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // Café POS state
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [cafeTargetSessionId, setCafeTargetSessionId] = useState('');

  // Ticker for Billiards active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setBilliardsTables((prev) =>
        prev.map((tbl) => {
          if (tbl.status === 'active') {
            return { ...tbl, elapsedSeconds: tbl.elapsedSeconds + 1 };
          }
          return tbl;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartBilliards = (tableId: string) => {
    setBilliardsTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId
          ? { ...tbl, status: 'active', customer: t('Walk-In Guest'), elapsedSeconds: 0 }
          : tbl
      )
    );
    toast.success(t('Billiards table session started.'));
  };

  const handleStopBilliards = (tableId: string) => {
    setBilliardsTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'available', customer: '', elapsedSeconds: 0 } : t
      )
    );
    toast.success(t('Billiards table session closed and settled.'));
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCustomerName = t('Quick Walk-In');
    let finalCustomerPhone = 'N/A';
    let finalCustomerId = '';

    if (customerMode === 'registered') {
      const selected = [
        { id: 'res-2', name: 'Youssef Mahmoud', phone: '0100-888-9901' },
        { id: 'res-1', name: 'Hassan Nour', phone: '0115-321-3312' },
        { id: 'res-3', name: 'Sara & Nadia', phone: '0106-777-7741' },
      ].find((c) => c.id === selectedRegisteredId);
      if (selected) {
        finalCustomerName = selected.name;
        finalCustomerPhone = selected.phone;
        finalCustomerId = selected.id;
      }
    } else if (customerMode === 'newguest') {
      if (!customerName || !customerPhone) {
        toast.error(t('Please enter name and phone.'));
        return;
      }
      finalCustomerName = customerName;
      finalCustomerPhone = customerPhone;
      finalCustomerId = `shadow-${Date.now()}`;
    }

    let rate = 80;
    if (roomType === 'VIP') rate = mode === 'single' ? 150 : 220;
    else if (roomType === 'Premium') rate = mode === 'single' ? 100 : 150;
    else rate = mode === 'single' ? 80 : 120;

    addSession({
      room: roomName,
      roomType,
      consoleTier,
      customer: finalCustomerName,
      phone: finalCustomerPhone,
      customerId: finalCustomerId || undefined,
      openingStaff: 'Ahmed Hassan',
      startTime: new Date().toLocaleTimeString('en-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      isOpenEnded,
      durationMinutes: isOpenEnded ? undefined : durationMinutes,
      hourlyRate: rate,
      controllers,
    });

    setShowStartModal(false);
    toast.success(t('Session started in ') + roomName + '!');
  };

  const handleEndSession = (session: LiveSession) => {
    setPaymentTarget(session);
  };

  const handlePaymentComplete = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setPaymentTarget(null);
      setEvaluationTarget(session);
    }
  };

  const handleEvaluationComplete = (sessionId: string) => {
    setEvaluationTarget(null);
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const match = prev.find((item) => item.id === product.id);
      if (match) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, price: product.sellingPrice, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckoutCafe = () => {
    if (cart.length === 0) {
      toast.error(t('Cart is empty.'));
      return;
    }
    if (cafeTargetSessionId) {
      // Add items to live play session bill
      cart.forEach((item) => {
        addCafeOrder(cafeTargetSessionId, item.id, item.qty);
      });
      toast.success(t('Drinks added to play session bill successfully.'));
    } else {
      // Direct Cash POS Checkout
      toast.success(
        t('Sale completed successfully! Total: ') +
          cart.reduce((s, i) => s + i.price * i.qty, 0) +
          ' EGP'
      );
    }
    setCart([]);
    setCafeTargetSessionId('');
  };

  // Café Table actions
  const openCafeTable = (tableId: string) => {
    setCafeTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'active', items: [] } : t))
    );
    toast.success(t('Opened table session.'));
  };

  const addDrinkToTable = (tableId: string, product: any) => {
    setCafeTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const exists = t.items.find((i) => i.id === product.id);
        let updatedItems;
        if (exists) {
          updatedItems = t.items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
          updatedItems = [
            ...t.items,
            { id: product.id, name: product.name, price: product.sellingPrice, qty: 1 },
          ];
        }
        return { ...t, items: updatedItems };
      })
    );
    toast.success(t('Added ') + product.name + t(' to table.'));
  };

  const clearDrinkFromTable = (tableId: string, itemId: string) => {
    setCafeTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        return { ...t, items: t.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const settleCafeTable = (tableId: string) => {
    const table = cafeTables.find((t) => t.id === tableId);
    if (!table) return;
    const total = table.items.reduce((s, i) => s + i.price * i.qty, 0);
    setCafeTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'available', items: [] } : t))
    );
    toast.success(t('Table Settle Completed! Paid: ') + total + ' EGP');
    setActiveTableId(null);
  };

  const formatBilliardsTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeTable = cafeTables.find((t) => t.id === activeTableId);

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LiveSessionsHeader sessionCount={sessions.length} totalRooms={12} />
        {activeZone === 'playstation' && (
          <button
            onClick={() => setShowStartModal(true)}
            className="btn-primary flex items-center gap-2 bg-primary border-primary hover:opacity-90 self-stretch sm:self-auto justify-center"
          >
            <Plus size={16} />
            {t('Start New Session')}
          </button>
        )}
      </div>

      {/* Cyberpunk Navigation Pills */}
      <div className="flex gap-2.5 border-b border-[#1F293D]/60 pb-3">
        <button
          onClick={() => setActiveZone('playstation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeZone === 'playstation'
              ? 'bg-[#8A2BE2] text-white border border-[#8A2BE2]/50 shadow-[0_0_12px_rgba(138,43,226,0.3)]'
              : 'bg-[#131722] border border-[#1F293D] text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gamepad2 size={14} />
          {t('Playstation Grid')}
        </button>
        <button
          onClick={() => setActiveZone('billiards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeZone === 'billiards'
              ? 'bg-[#8A2BE2] text-white border border-[#8A2BE2]/50 shadow-[0_0_12px_rgba(138,43,226,0.3)]'
              : 'bg-[#131722] border border-[#1F293D] text-muted-foreground hover:text-foreground'
          }`}
        >
          ⏱️ {t('Billiards Area')}
        </button>
        <button
          onClick={() => setActiveZone('cafe')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeZone === 'cafe'
              ? 'bg-[#8A2BE2] text-white border border-[#8A2BE2]/50 shadow-[0_0_12px_rgba(138,43,226,0.3)]'
              : 'bg-[#131722] border border-[#1F293D] text-muted-foreground hover:text-foreground'
          }`}
        >
          <CupSoda size={14} />
          {t('Café Tables & Service')}
        </button>
      </div>

      {/* Zone Rendering */}
      {activeZone === 'playstation' && (
        <SessionsGrid
          sessions={sessions}
          onAddProduct={(s) => setAddProductTarget(s)}
          onEndSession={handleEndSession}
        />
      )}

      {activeZone === 'billiards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {billiardsTables.map((table) => (
            <div
              key={table.id}
              className={`bg-[#131722] border rounded-xl p-4 flex flex-col justify-between h-[220px] transition-all ${
                table.status === 'active'
                  ? 'border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.06)]'
                  : 'border-[#1F293D]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1F293D]/60 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{table.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    {t(table.type)}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    table.status === 'active'
                      ? 'bg-emerald-500/10 text-[#00FFA3] border-emerald-500/20'
                      : 'bg-slate-800/20 text-slate-400 border-slate-700/30'
                  }`}
                >
                  {table.status === 'active' ? t('OCCUPIED') : t('AVAILABLE')}
                </span>
              </div>

              {table.status === 'active' ? (
                <div className="flex flex-col flex-grow py-3 justify-center">
                  <span className="font-mono text-xl font-black text-[#00FFA3] tracking-widest">
                    {formatBilliardsTime(table.elapsedSeconds)}
                  </span>
                  <p className="text-xs text-slate-300 font-semibold mt-1">👤 {table.customer}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {t('Rate:')} {table.rate} EGP/hr
                  </p>
                </div>
              ) : (
                <div className="flex flex-col flex-grow py-3 justify-center text-center">
                  <span className="text-lg font-black text-white">{table.rate} EGP/hr</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t('Standard booking rate')}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[#1F293D]/60">
                {table.status === 'active' ? (
                  <button
                    onClick={() => handleStopBilliards(table.id)}
                    className="w-full bg-[#E11D48]/10 hover:bg-[#E11D48]/20 border border-[#E11D48]/30 text-[#E11D48] py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 h-9 transition-colors"
                  >
                    🧾 {t('Checkout & Settle')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartBilliards(table.id)}
                    className="w-full bg-[#00FFA3]/5 border border-[#00FFA3]/20 hover:bg-[#00FFA3]/15 text-[#00FFA3] py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 h-9 transition-colors"
                  >
                    ⚡ {t('Start Table Session')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeZone === 'cafe' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1F293D]/30 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('Café Table Service (15 Active Tables)')}
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              {t('Click table to add drinks and checkout')}
            </span>
          </div>

          {/* Café 15 Tables Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {cafeTables.map((table) => {
              const activeBill = table.items.reduce((s, i) => s + i.price * i.qty, 0);
              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (table.status === 'available') {
                      openCafeTable(table.id);
                    }
                    setActiveTableId(table.id);
                  }}
                  className={`border rounded-xl p-3.5 h-[135px] flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                    table.status === 'active'
                      ? 'bg-primary/5 border-primary/40 hover:border-primary shadow-[0_0_8px_rgba(138,43,226,0.1)]'
                      : 'bg-[#131722] border-[#1F293D] hover:border-[#1F293D]/90'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{table.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${table.status === 'active' ? 'bg-[#00FFA3] animate-pulse' : 'bg-slate-700'}`}
                    />
                  </div>

                  <div className="my-1.5">
                    {table.status === 'active' ? (
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {t('Running Bill:')}
                        </p>
                        <p className="text-sm font-black text-[#00FFA3] font-mono">
                          {activeBill} EGP
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">
                        {t('Table Vacant')}
                      </p>
                    )}
                  </div>

                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase text-right block hover:underline">
                    {table.status === 'active' ? t('Manage orders →') : t('Open Table →')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Café Table Service Manage Modal */}
      {activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85" onClick={() => setActiveTableId(null)} />
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto scrollbar-thin text-xs text-foreground">
            {/* Left: Drinks Catalog */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t('Add Drinks')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addDrinkToTable(activeTable.id, p)}
                    className="bg-[#131722] border border-[#1F293D] rounded-xl p-3 flex flex-col items-center justify-between text-center hover:border-primary/45 transition-colors h-[110px]"
                  >
                    <span className="text-xs font-bold text-white leading-tight">{p.name}</span>
                    <span className="text-xs font-black text-[#00FFA3] font-mono mt-1">
                      {p.sellingPrice} EGP
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {t('Stock:')} {p.stock}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Table Order List & Settle */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {activeTable.name} {t('Bill')}
                  </h3>
                  <button
                    onClick={() => setActiveTableId(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeTable.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-lg p-2.5"
                    >
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.price} EGP × {item.qty}
                        </p>
                      </div>
                      <button
                        onClick={() => clearDrinkFromTable(activeTable.id, item.id)}
                        className="text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {activeTable.items.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-8">
                      {t('No drinks added yet.')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1F293D]/60 mt-4">
                <div className="flex items-center justify-between text-xs text-white font-bold py-1">
                  <span>{t('TOTAL BILL:')}</span>
                  <span className="font-mono text-sm text-[#00FFA3]">
                    {activeTable.items.reduce((s, i) => s + i.price * i.qty, 0)} EGP
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTableId(null)}
                    className="btn-secondary flex-grow py-2.5 h-10 font-bold"
                  >
                    {t('Close Window')}
                  </button>
                  <button
                    onClick={() => settleCafeTable(activeTable.id)}
                    disabled={activeTable.items.length === 0}
                    className="bg-[#00FFA3] hover:bg-[#00e5a3] text-black flex-grow py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} />
                    {t('Settle Table')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentTarget && (
        <PaymentModal
          session={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {evaluationTarget && (
        <EvaluationPopup session={evaluationTarget} onComplete={handleEvaluationComplete} />
      )}

      {addProductTarget && (
        <AddProductModal session={addProductTarget} onClose={() => setAddProductTarget(null)} />
      )}

      {/* Start Session Modal Dialog */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85" onClick={() => setShowStartModal(false)} />

          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {t('Open Playstation Playing Session')}
              </h2>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    {t('Target Station')}
                  </label>
                  <select
                    className="input-field"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  >
                    <option value="Room VIP-1">Room VIP-1</option>
                    <option value="Room VIP-2">Room VIP-2</option>
                    <option value="Room 3">Room 3</option>
                    <option value="Room 4">Room 4</option>
                    <option value="Room 5">Room 5</option>
                    <option value="Room 6">Room 6</option>
                    <option value="Room 7">Room 7</option>
                    <option value="Room 8">Room 8</option>
                    <option value="Room 9">Room 9</option>
                    <option value="Room 10">Room 10</option>
                    <option value="Room 11">Room 11</option>
                    <option value="Room 12">Room 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    {t('Console Spec')}
                  </label>
                  <select
                    className="input-field"
                    value={consoleTier}
                    onChange={(e) => setConsoleTier(e.target.value)}
                  >
                    <option value="PS5 PRO">PS5 PRO</option>
                    <option value="PS5 Slim">PS5 Slim</option>
                    <option value="PS5 Standard">PS5 Standard</option>
                    <option value="PS4 Pro">PS4 Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  {t('Select Customer Entry Mode')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['walkin', 'registered', 'newguest'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setCustomerMode(m)}
                      className={`py-2 rounded-lg font-bold border transition-colors ${
                        customerMode === m
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m === 'walkin'
                        ? t('Walk-in')
                        : m === 'registered'
                          ? t('Registered')
                          : t('New Profile')}
                    </button>
                  ))}
                </div>
              </div>

              {customerMode === 'registered' && (
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    {t('Search Saved Customer Profiles')}
                  </label>
                  <select
                    className="input-field"
                    value={selectedRegisteredId}
                    onChange={(e) => setSelectedRegisteredId(e.target.value)}
                  >
                    <option value="res-2">{t('Youssef Mahmoud (Regular)')}</option>
                    <option value="res-1">{t('Hassan Nour (Loyal)')}</option>
                    <option value="res-3">{t('Sara & Nadia (VIP)')}</option>
                  </select>
                </div>
              )}

              {customerMode === 'newguest' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">
                      {t('Full Name')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={t('Customer Name')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">
                      {t('Phone Number')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="0100..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    {t('Time Mode')}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpenEnded(true)}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                        isOpenEnded
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      {t('Open Limit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpenEnded(false)}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                        !isOpenEnded
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      {t('Fixed Time')}
                    </button>
                  </div>
                </div>

                {!isOpenEnded && (
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">
                      {t('Duration (Minutes)')}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min={15}
                      step={15}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="btn-secondary flex-1 py-2"
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary bg-primary flex-1 py-2 text-white">
                  {t('Confirm & Start Session')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
