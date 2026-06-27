'use client';

import React from 'react';
import { Order } from '@/types/orders';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface DetailsProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<DetailsProps> = ({ order, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      showToast(`Copied ${order.id} to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not access clipboard operations', 'error');
    }
  };

  return (
    <Modal isOpen={!!order} onClose={onClose} title="Order Detailed Overview">
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tracking Identifier</span>
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{order.id}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            aria-label="Copy identifier system hash code"
          >
            {copied ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Customer Name</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.customerName}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Email Address</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate block">{order.email}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Processing Status</span>
            <div><Badge variant={order.status}>{order.status}</Badge></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Severity Priority</span>
            <div><Badge variant={order.priority}>{order.priority}</Badge></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Cart Quantities</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.itemsCount} Items</span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">Gross Revenue</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3.5 dark:border-slate-800 text-right">
          <span className="text-xs text-slate-400 block">System Logs Ingestion Timestamp</span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </span>
        </div>
      </div>
    </Modal>
  );
};