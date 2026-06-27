import { Order } from '@/types/orders';
import { ORDER_STATUS_LABELS, ORDER_PRIORITY_LABELS } from '@/constants/orders';

export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'شناسه سفارش',
    'نام مشتری',
    'ایمیل',
    'وضعیت',
    'اولویت',
    'تعداد آیتم‌ها',
    'مبلغ کل',
    'تاریخ ایجاد',
  ];

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const rows = [
    headers.map(escape).join(','),
    ...orders.map((o) =>
      [
        escape(o.id),
        escape(o.customerName),
        escape(o.email),
        // ✅ Fix: export Persian labels instead of raw enum values
        escape(ORDER_STATUS_LABELS[o.status]),
        escape(ORDER_PRIORITY_LABELS[o.priority]),
        String(o.itemsCount),
        String(o.totalAmount),
        escape(new Date(o.createdAt).toISOString()),
      ].join(','),
    ),
  ];

  // ✅ Fix: prepend UTF-8 BOM so Excel opens Persian text correctly
  const BOM  = '\uFEFF';
  const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');

  a.href     = url;
  a.download = `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`;
  a.style.visibility = 'hidden';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // ✅ Fix: revoke object URL to free memory
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}