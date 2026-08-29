'use client';
import React, { useState } from 'react';
import { X, Banknote, Smartphone, Wallet, ShieldAlert, Trash2, CheckSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { LiveSession, Controller } from '@/types';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';

type PaymentMethod = 'Cash' | 'Card' | 'Vodafone Cash';

interface PaymentModalProps {
  session: LiveSession;
  onClose: () => void;
  onPaymentComplete: (sessionId: string) => void;
}

export default function PaymentModal({ session, onClose, onPaymentComplete }: PaymentModalProps) {
  const { currentRole, voidCafeItem, checkoutSession } = useApp();
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [controllerStates, setControllerStates] = useState<Record<string, Controller['status']>>(
    () => {
      return Object.fromEntries(session.controllers.map((id) => [id, 'Good']));
    }
  );

  const productsCost = session.products.reduce((s, p) => s + p.price * p.qty, 0);
  // Current time cost is session.runningBill - productsCost, but let's make sure it's at least 0
  const sessionCost = Math.max(0, session.runningBill - productsCost);
  const totalBill = session.runningBill;
  const netTotal = Math.max(0, totalBill - discountAmount);

  const handleControllerStatusChange = (id: string, status: any) => {
    setControllerStates((prev) => ({ ...prev, [id]: status }));
  };

  const handleVoidItem = (productId: string) => {
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      toast.error(t('Restricted Action: Only Owners and Managers can void items from invoices.'));
      return;
    }
    voidCafeItem(session.id, productId);
    toast.success(t('Billed product voided from session.'));
  };

  const handleCheckoutSubmit = () => {
    // Build array for checkoutSession
    const controllersLog = Object.entries(controllerStates).map(([id, status]) => ({
      id,
      status,
    }));

    checkoutSession(session.id, controllersLog, discountAmount, selectedMethod);
    toast.success(t('Session settled! Receipt generated for ') + session.customer + '.');
    onPaymentComplete(session.id);
  };

  const canApplyDiscount = currentRole === 'owner' || currentRole === 'manager';
  const canVoidItem = currentRole === 'owner' || currentRole === 'manager';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t('Settle & Checkout Session')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.room} · {session.customer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto scrollbar-thin space-y-5 flex-1">
          {/* Controllers Inspection Check */}
          <div className="bg-[#0b0914] border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare size={14} />
              {t('Controller Hardware Quality Checklist')}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-3">
              {t(
                'Please inspect the controllers used. Select status to log stick drift or low batteries:'
              )}
            </p>
            {session.controllers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                {t('No controllers were checked out for this session.')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.controllers.map((ctrlId) => (
                  <div
                    key={ctrlId}
                    className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border/30"
                  >
                    <span className="text-xs font-mono font-bold text-foreground">{ctrlId}</span>
                    <select
                      value={controllerStates[ctrlId]}
                      onChange={(e) => handleControllerStatusChange(ctrlId, e.target.value)}
                      className="bg-background border border-border text-xs rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Good">{t('Good Condition')}</option>
                      <option value="Stick Drift">{t('Stick Drift')}</option>
                      <option value="Broken Buttons">{t('Broken Buttons')}</option>
                      <option value="Under Repair / Checkup">{t('Under Repair / Checkup')}</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill Invoice & Void Item controls */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/30">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {t('Live Invoice Details')}
            </p>

            {/* Time usage */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/30">
              <span className="text-muted-foreground">{t('Session Play Time')}</span>
              <span className="font-semibold text-foreground">
                {sessionCost.toLocaleString()} EGP
              </span>
            </div>

            {/* Cafe products list */}
            {session.products.length > 0 ? (
              <div className="space-y-2 py-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  {t('Café Purchases')}
                </span>
                {session.products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs bg-[#100d1e] p-2 rounded border border-border/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">
                        {p.name} × {p.qty}
                      </span>
                      <span className="text-muted-foreground">({p.price} EGP/ea)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold font-tabular text-foreground">
                        {(p.price * p.qty).toLocaleString()} EGP
                      </span>
                      <button
                        onClick={() => handleVoidItem(p.id)}
                        className={`text-danger hover:bg-danger/10 p-1.5 rounded transition-colors ${!canVoidItem ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={
                          canVoidItem ? t('Void Item') : t('Void Restricted (Requires Manager)')
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-1">
                {t('No products billed to this invoice.')}
              </p>
            )}
          </div>

          {/* Subtotal, Discounts, & Manual adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/40 p-4 rounded-xl border border-border/30">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                {t('Discount Settings')}
              </span>
              {canApplyDiscount ? (
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">
                    {t('Apply Manual Discount (EGP):')}
                  </label>
                  <input
                    type="number"
                    className="bg-background border border-border text-sm rounded px-3 py-2 w-full text-foreground"
                    placeholder="EGP"
                    value={discountAmount || ''}
                    onChange={(e) =>
                      setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 p-2.5 rounded-lg">
                  <ShieldAlert size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-warning-foreground leading-snug">
                    {t(
                      'Manual discounts locked. Customer/Staff role cannot modify prices. Ask Owner/Manager for permission override.'
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border/30 space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {t('Receipt Total')}
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('Subtotal:')}</span>
                <span className="font-semibold text-foreground">
                  {totalBill.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-danger">
                <span>{t('Discount:')}</span>
                <span>-{discountAmount.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-accent pt-1.5 border-t border-border/40">
                <span>{t('Net Payable:')}</span>
                <span>{netTotal.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              {t('Payment Method')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Card', 'Vodafone Cash'] as PaymentMethod[]).map((method) => {
                const isSelected = selectedMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all duration-150 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/20 text-muted-foreground hover:border-border/60 hover:text-foreground'
                    }`}
                  >
                    {method === 'Cash' ? (
                      <Banknote size={18} />
                    ) : method === 'Card' ? (
                      <Smartphone size={18} />
                    ) : (
                      <Wallet size={18} />
                    )}
                    <span className="text-xs font-semibold">{t(method)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t('Cancel')}
          </button>
          <button
            onClick={handleCheckoutSubmit}
            className="btn-primary flex-1 bg-accent border-accent text-white flex items-center justify-center gap-2 hover:bg-accent/90"
          >
            {t('Settle Play Invoice')}
          </button>
        </div>
      </div>
    </div>
  );
}
