'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { Package, ShieldAlert, Edit2, Check, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

export default function InventoryPage() {
  const { products, updateProductPrice, updateProductStock, currentRole, alerts } = useApp();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const handleStartEdit = (prodId: string, currentPrice: number) => {
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      toast.error(t('Restricted: Staff role cannot edit product base rates.'));
      return;
    }
    setEditingProductId(prodId);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (prodId: string) => {
    const num = parseFloat(tempPrice);
    if (isNaN(num) || num <= 0) {
      toast.error(t('Invalid price amount.'));
      return;
    }

    const res = updateProductPrice(prodId, num);
    if (res?.success) {
      toast.success(t('Product price updated successfully.'));
    } else {
      toast.error(res?.message || t('Price update failed.'));
    }
    setEditingProductId(null);
  };

  const handleRestock = (id: string, qty: number) => {
    updateProductStock(id, qty);
    toast.success(`${t('Inventory stock adjusted by')} ${qty}`);
  };

  const canEdit = currentRole === 'owner' || currentRole === 'manager';
  const { t } = useTranslation();

  return (
    <AppLayout currentPath="/inventory">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('Café Inventory & Profit margins')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('Manage cost prices, target margins, stock levels, and audit price updates.')}
          </p>
        </div>

        {/* Global Warnings Banner if profit integrity alerts exist */}
        {alerts.length > 0 && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              {t('Profit Margin Integrity Alerts')}
            </h3>
            <ul className="list-disc pl-5 text-xs text-foreground/95 space-y-1">
              {alerts.map((al) => (
                <li key={al.id}>{al.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {t('Product Catalog')}
          </h2>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold">
                  <th className="py-3 px-2">{t('Item Name')}</th>
                  <th className="py-3 px-2">{t('Cost Price')}</th>
                  <th className="py-3 px-2">{t('Selling Price')}</th>
                  <th className="py-3 px-2">{t('Target Profit Margin')}</th>
                  <th className="py-3 px-2">{t('Current Profit Margin')}</th>
                  <th className="py-3 px-2">{t('Stock Level')}</th>
                  <th className="py-3 px-2 text-right">{t('Inventory Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {products.map((prod) => {
                  const marginVal =
                    prod.sellingPrice > 0
                      ? (prod.sellingPrice - prod.costPrice) / prod.sellingPrice
                      : 0;
                  const marginPercent = Math.round(marginVal * 100);
                  const isMarginBelowTarget = marginVal < prod.minProfitMargin;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/10">
                      <td className="py-4 px-2 font-bold text-foreground">{prod.name}</td>
                      <td className="py-4 px-2 font-mono text-muted-foreground">
                        {prod.costPrice} {t('EGP')}
                      </td>
                      <td className="py-4 px-2">
                        {editingProductId === prod.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              className="bg-background border border-border text-xs rounded px-2 py-1 w-20 text-foreground"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                            />
                            <button
                              onClick={() => handleSavePrice(prod.id)}
                              className="p-1 bg-accent/20 border border-accent/30 text-accent rounded hover:bg-accent/30"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground">
                              {prod.sellingPrice} {t('EGP')}
                            </span>
                            {canEdit && (
                              <button
                                onClick={() => handleStartEdit(prod.id, prod.sellingPrice)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                title={t('Override base price')}
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2 font-semibold text-muted-foreground">
                        {Math.round(prod.minProfitMargin * 100)}%
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`font-bold inline-flex items-center gap-1 ${isMarginBelowTarget ? 'text-danger' : 'text-accent'}`}
                        >
                          {marginPercent}%
                          {isMarginBelowTarget && <ShieldAlert size={12} className="text-danger" />}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${prod.stock < 10 ? 'bg-danger/10 text-danger border border-danger/20' : 'text-foreground bg-muted'}`}
                        >
                          {prod.stock} {t('units')}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestock(prod.id, 5)}
                            className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded font-bold text-[10px] transition-colors"
                          >
                            {t('+5 RESTOCK')}
                          </button>
                          <button
                            onClick={() => handleRestock(prod.id, -1)}
                            className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded font-bold text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={prod.stock === 0}
                          >
                            {t('-1 SCRAP')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
