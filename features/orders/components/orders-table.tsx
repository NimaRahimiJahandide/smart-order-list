'use client';

import React from 'react';
import { Order, OrderFilters } from '@/types/orders';
import { ITEMS_PER_PAGE, ORDER_STATUS_LABELS, ORDER_PRIORITY_LABELS } from '@/constants/orders';
import { Badge } from '@/components/ui/badge';

interface TableProps {
  orders: Order[];
  totalCount: number;
  filters: OrderFilters;
  onFilterChange: (
    updater: Partial<OrderFilters> | ((prev: OrderFilters) => Partial<OrderFilters>),
  ) => void;
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
}

/* ── tiny icon components ─────────────────────────────────────── */
const ArrowUpDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
  </svg>
);
const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);
const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

type SortableField = 'createdAt' | 'totalAmount';

export const OrdersTable: React.FC<TableProps> = ({
  orders,
  totalCount,
  filters,
  onFilterChange,
  isLoading,
  onSelectOrder,
}) => {
  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);

  const toggleSort = (field: SortableField) => {
    if (filters.sortBy === field) {
      onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      onFilterChange({ sortBy: field, sortOrder: 'desc' });
    }
  };

  const SortIcon = ({ field }: { field: SortableField }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDownIcon className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === 'asc'
      ? <ArrowUpIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
      : <ArrowDownIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />;
  };

  const thBase =
    'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/50">
              <th className={`${thBase} text-center`}>شناسه</th>
              <th className={`${thBase} text-center`}>مشتری</th>
              <th className={`${thBase} text-center`}>وضعیت</th>
              <th className={`${thBase} text-center`}>اولویت</th>
              <th className={`${thBase} text-center`}>آیتم‌ها</th>
              <th
                className={`${thBase} text-center cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200`}
                onClick={() => toggleSort('totalAmount')}
                aria-sort={
                  filters.sortBy === 'totalAmount'
                    ? filters.sortOrder === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
              >
                <div className="inline-flex items-center justify-center">
                  مبلغ کل <SortIcon field="totalAmount" />
                </div>
              </th>
              <th
                className={`${thBase} text-center cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200`}
                onClick={() => toggleSort('createdAt')}
                aria-sort={
                  filters.sortBy === 'createdAt'
                    ? filters.sortOrder === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
              >
                <div className="inline-flex items-center justify-center">
                  تاریخ ایجاد <SortIcon field="createdAt" />
                </div>
              </th>
              <th className={`${thBase} text-left`}>عملیات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                    هیچ سفارشی یافت نشد
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    پارامترهای جستجو یا فیلترها را گسترش دهید.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-center text-slate-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-slate-400">{order.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {/* ✅ Fix: use Persian label, not raw enum */}
                    <Badge variant={order.status}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {/* ✅ Fix: use Persian label, not raw enum */}
                    <Badge variant={order.priority}>
                      {ORDER_PRIORITY_LABELS[order.priority]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400 text-center">
                    {order.itemsCount}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white text-center">
                    ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 text-center">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td
                    className="px-5 py-3.5 text-left text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="rounded-lg p-1.5 text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      aria-label={`مشاهده جزئیات ${order.id}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          صفحه{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{filters.page}</span>
          {' '}از{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
          {' '}
          <span className="text-slate-400">({totalCount} سفارش)</span>
        </p>

        <nav className="flex items-center gap-1" aria-label="صفحه‌بندی">
          {[
            { label: '«', page: 1,                         disabled: filters.page === 1,         title: 'صفحه اول' },
            { label: '‹', page: filters.page - 1,          disabled: filters.page === 1,         title: 'صفحه قبل' },
            { label: '›', page: filters.page + 1,          disabled: filters.page === totalPages, title: 'صفحه بعد' },
            { label: '»', page: totalPages,                 disabled: filters.page === totalPages, title: 'صفحه آخر' },
          ].map(({ label, page, disabled, title }) => (
            <button
              key={title}
              onClick={() => onFilterChange({ page })}
              disabled={disabled || isLoading}
              aria-label={title}
              title={title}
              className="min-w-[2rem] rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};