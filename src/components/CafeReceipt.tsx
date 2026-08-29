'use client';
import React from 'react';
import type { CafeTableItem } from '@/types';
import { useTranslation } from '@/i18n';

interface CafeReceiptProps {
  tableName: string;
  items: CafeTableItem[];
  paymentMethod: string;
  discount?: number;
  customerName?: string;
}

/**
 * CafeReceipt — Hidden thermal receipt component.
 * Renders inside #cafe-receipt and triggered via window.print().
 * Styled for 80mm thermal paper via @media print.
 */
export default function CafeReceipt({
  tableName,
  items,
  paymentMethod,
  discount = 0,
  customerName,
}: CafeReceiptProps) {
  const { t } = useTranslation();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const serviceTax = Math.round(subtotal * 0.12);
  const total = Math.max(0, subtotal + serviceTax - discount);
  const now = new Date().toLocaleString('en-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <>
      {/* Print-only styles injected inline */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cafe-receipt, #cafe-receipt * { visibility: visible !important; }
          #cafe-receipt {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
            color: #000 !important;
            background: #fff !important;
            padding: 8px !important;
          }
        }
      `}</style>

      <div
        id="cafe-receipt"
        style={{ display: 'none' }}
        className="print:block font-mono text-xs text-black bg-white p-2 w-[80mm]"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <p className="font-bold text-sm">⚡ ZOOX HUB</p>
          <p className="text-[10px]">{t('PlayStation & Café Lounge')}</p>
          <p className="text-[10px]">{t('Cairo, Egypt')}</p>
        </div>

        {/* Receipt Info */}
        <div className="mb-2 text-[11px]">
          <p>
            <span className="font-bold">{t('TABLE:')}</span> {tableName}
          </p>
          {customerName && (
            <p>
              <span className="font-bold">{t('GUEST:')}</span> {customerName}
            </p>
          )}
          <p>
            <span className="font-bold">{t('DATE:')}</span> {now}
          </p>
          <p>
            <span className="font-bold">{t('PAYMENT:')}</span> {paymentMethod}
          </p>
        </div>

        {/* Items */}
        <div className="border-t border-dashed border-black pt-1 mb-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-1 font-bold text-[10px] mb-1">
            <span>{t('ITEM')}</span>
            <span>{t('QTY')}</span>
            <span>EGP</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-x-1 text-[10px]">
              <span>{item.name}</span>
              <span>×{item.qty}</span>
              <span>{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-black pt-1 text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span>{t('Subtotal:')}</span>
            <span>{subtotal} EGP</span>
          </div>
          <div className="flex justify-between">
            <span>{t('Service (12%):')}</span>
            <span>{serviceTax} EGP</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>{t('Discount:')}</span>
              <span>-{discount} EGP</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-black pt-0.5">
            <span>{t('TOTAL:')}</span>
            <span>{total} EGP</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-dashed border-black mt-2 pt-1 text-[10px]">
          <p>{t('Thank you for visiting Zoox Hub!')}</p>
          <p>شكراً لزيارتكم زوكس هاب</p>
        </div>
      </div>
    </>
  );
}
