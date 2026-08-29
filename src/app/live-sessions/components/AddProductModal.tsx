'use client';
import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { LiveSession } from '@/types';
import { useTranslation } from '@/i18n';
import { toast } from 'sonner';

interface AddProductModalProps {
  session: LiveSession;
  onClose: () => void;
}

export default function AddProductModal({ session, onClose }: AddProductModalProps) {
  const { products, addCafeOrder, currentRole } = useApp();
  const { t } = useTranslation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Drinks', 'Snacks', 'Food'];

  const getCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('pepsi') || n.includes('water') || n.includes('juice') || n.includes('bull'))
      return 'Drinks';
    if (n.includes('chips') || n.includes('chocolate') || n.includes('popcorn')) return 'Snacks';
    return 'Food';
  };

  const filtered = products.filter((p) => {
    if (categoryFilter === 'All') return true;
    return getCategory(p.name) === categoryFilter;
  });

  const adjustQty = (productId: string, delta: number, stock: number) => {
    const currentQty = quantities[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    if (newQty > stock) {
      toast.error(t('Cannot exceed available stock of ') + stock);
      return;
    }
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
  };

  const handleCustomPriceChange = (productId: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCustomPrices((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const handleAddToSession = () => {
    let count = 0;
    let failed = false;

    Object.entries(quantities).forEach(([prodId, qty]) => {
      if (qty <= 0) return;
      const product = products.find((p) => p.id === prodId);
      if (!product) return;

      const overridePrice = customPrices[prodId];
      const res = addCafeOrder(session.id, prodId, qty, overridePrice);

      if (res.success) {
        count++;
      } else {
        failed = true;
        toast.error(res.message || t('Failed to add ') + product.name);
      }
    });

    if (count > 0) {
      toast.success(t('Successfully added orders to ') + session.room);
      onClose();
    }
  };

  const canEditPrices = currentRole === 'owner' || currentRole === 'manager';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl slide-up max-h-[85vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">{t('Add Cafe Order')}</h2>
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

        {/* Category Filter */}
        <div className="px-5 py-3 border-b border-border flex gap-1.5 overflow-x-auto scrollbar-thin flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={`cat-filter-${cat}`}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {filtered.map((prod) => {
            const qty = quantities[prod.id] || 0;
            const itemCategory = getCategory(prod.name);
            const displayPrice =
              customPrices[prod.id] !== undefined ? customPrices[prod.id] : prod.sellingPrice;

            return (
              <div
                key={prod.id}
                className={`p-3 rounded-xl border transition-all duration-150 flex flex-col gap-2.5 ${
                  qty > 0
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-muted/20 hover:border-border/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{prod.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t('Stock:')}{' '}
                      <span className={prod.stock < 5 ? 'text-danger font-bold' : ''}>
                        {prod.stock}
                      </span>{' '}
                      · {t(itemCategory)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{displayPrice} EGP</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustQty(prod.id, -1, prod.stock)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-foreground">
                        {qty}
                      </span>
                      <button
                        onClick={() => adjustQty(prod.id, 1, prod.stock)}
                        disabled={prod.stock <= 0}
                        className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom price overlay (Owner/Manager only) */}
                {qty > 0 && (
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle size={12} className="text-warning" />
                      {t('Margin Target:')} {Math.round(prod.minProfitMargin * 100)}%
                    </span>
                    {canEditPrices ? (
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-muted-foreground font-semibold">
                          {t('Override Price (EGP):')}
                        </label>
                        <input
                          type="number"
                          className="bg-background border border-border text-xs rounded px-2 py-1 w-16 text-foreground text-center"
                          value={customPrices[prod.id] ?? prod.sellingPrice}
                          onChange={(e) => handleCustomPriceChange(prod.id, e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">
                        {t('Pricing Locked (Staff)')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              {t('Cancel')}
            </button>
            <button
              onClick={handleAddToSession}
              disabled={Object.values(quantities).reduce((a, b) => a + b, 0) === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={14} />
              {t('Confirm Add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
