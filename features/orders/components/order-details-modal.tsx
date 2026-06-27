'use client';

import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { ORDER_STATUS_LABELS, ORDER_PRIORITY_LABELS } from '@/constants/orders';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface DetailsProps {
  order: Order | null;
  onClose: () => void;
}

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <span className="text-xs font-medium text-slate-400 block mb-0.5">{label}</span>
    <div className="text-sm font-semibold text-slate-900 dark:text-white">{children}</div>
  </div>
);

export const OrderDetailsModal: React.FC<DetailsProps> = ({ order, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      showToast(`شناسه ${order.id} کپی شد`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('دسترسی به کلیپ‌بورد امکان‌پذیر نیست', 'error');
    }
  };

  return (
    <Modal isOpen={!!order} onClose={onClose} title="جزئیات سفارش">
      <div className="space-y-5">

        {/* Order ID row */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              شناسه پیگیری
            </span>
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
              {order.id}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
            aria-label="کپی شناسه سفارش"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                کپی شد
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                کپی شناسه
              </>
            )}
          </button>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="نام مشتری">{order.customerName}</DetailRow>

          <DetailRow label="ایمیل">
            <span className="truncate block">{order.email}</span>
          </DetailRow>

          <DetailRow label="وضعیت پردازش">
            {/* ✅ Fix: Persian label shown in modal too */}
            <Badge variant={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </DetailRow>

          <DetailRow label="اولویت">
            {/* ✅ Fix: Persian label for priority */}
            <Badge variant={order.priority}>{ORDER_PRIORITY_LABELS[order.priority]}</Badge>
          </DetailRow>

          <DetailRow label="تعداد آیتم‌ها">{order.itemsCount}</DetailRow>

          <DetailRow label="درآمد کل">
            ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </DetailRow>
        </div>

        {/* Timestamp */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
          <span className="text-xs text-slate-400 block">زمان ثبت در سیستم</span>
          {/* ✅ Fix: show both Jalali and Gregorian for clarity */}
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {new Date(order.createdAt).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' — '}
            {new Date(order.createdAt).toLocaleTimeString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </Modal>
  );
};