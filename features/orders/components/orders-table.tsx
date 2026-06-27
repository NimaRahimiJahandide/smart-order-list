'use client';

import React from 'react';
import { Order, OrderFilters } from '@/types/orders';
import { ITEMS_PER_PAGE } from '@/constants/orders';
import { Badge } from '@/components/ui/badge';

interface TableProps {
  orders: Order[];
  totalCount: number;
  filters: OrderFilters;
  onFilterChange: (updater: Partial<OrderFilters> | ((prev: OrderFilters) => Partial<OrderFilters>)) => void;
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
}

const LABELS = {
  id: "شناسه",
  customer: "مشتری",
  status: "وضعیت",
  priority: "اولویت",
  items: "آیتم‌ها",
  totalAmount: "مبلغ کل",
  createdAt: "تاریخ ایجاد",
  actions: "عملیات",
  noDataTitle: "هیچ داده‌ای یافت نشد",
  noDataDesc: "پارامترهای جستجو یا فیلترها را گسترش دهید.",
  page: "صفحه",
  of: "از",
  firstPage: "صفحه اول",
  prevPage: "صفحه قبل",
  nextPage: "صفحه بعد",
  lastPage: "صفحه آخر",
} as const;

// SVG icons unchanged (omitted for brevity in reasoning, kept identical)
const ArrowUpDownSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
);

const ArrowUpSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const ArrowDownSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const ChevronsLeftSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
);

const ChevronLeftSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const ChevronsRightSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>
);

const EyeSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
);

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

export const OrdersTable: React.FC<TableProps> = ({
  orders,
  totalCount,
  filters,
  onFilterChange,
  isLoading,
  onSelectOrder,
}) => {
  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);

  const toggleSort = (field: 'createdAt' | 'totalAmount') => {
    if (filters.sortBy === field) {
      onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      onFilterChange({ sortBy: field, sortOrder: 'desc' });
    }
  };

  const renderSortIcon = (field: 'createdAt' | 'totalAmount') => {
    if (filters.sortBy !== field) return <ArrowUpDownSVG className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === 'asc' ? (
      <ArrowUpSVG className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    ) : (
      <ArrowDownSVG className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/50 sticky top-0 backdrop-blur-sm z-10">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {LABELS.id}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {LABELS.customer}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {LABELS.status}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {LABELS.priority}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {LABELS.items}
              </th>

              <th
                onClick={() => toggleSort('totalAmount')}
                className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400"
              >
                <div className="flex items-center">
                  {LABELS.totalAmount} {renderSortIcon('totalAmount')}
                </div>
              </th>

              <th
                onClick={() => toggleSort('createdAt')}
                className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400"
              >
                <div className="flex items-center">
                  {LABELS.createdAt} {renderSortIcon('createdAt')}
                </div>
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right text-slate-500 dark:text-slate-400">
                {LABELS.actions}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">

            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx}>
                  {Array.from({ length: 8 }).map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      {LABELS.noDataTitle}
                    </p>
                    <p className="text-sm text-slate-400">
                      {LABELS.noDataDesc}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">
                    {order.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-slate-400">{order.email}</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant={order.status}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant={order.priority}>{order.priority}</Badge>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                    {order.itemsCount}
                  </td>

                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">
                    ${order.totalAmount.toFixed(2)}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>

                  <td className="px-5 py-3.5 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="rounded-lg p-1 text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label={`مشاهده جزئیات ${order.id}`}
                    >
                      <EyeSVG className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {LABELS.page}{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{filters.page}</span>{' '}
          {LABELS.of}{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1">

          <button
            onClick={() => onFilterChange({ page: 1 })}
            disabled={filters.page === 1 || isLoading}
            aria-label={LABELS.firstPage}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronsLeftSVG className="h-4 w-4" />
          </button>

          <button
            onClick={() => onFilterChange({ page: Math.max(filters.page - 1, 1) })}
            disabled={filters.page === 1 || isLoading}
            aria-label={LABELS.prevPage}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronLeftSVG className="h-4 w-4" />
          </button>

          <button
            onClick={() => onFilterChange({ page: Math.min(filters.page + 1, totalPages) })}
            disabled={filters.page === totalPages || isLoading}
            aria-label={LABELS.nextPage}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronRightSVG className="h-4 w-4" />
          </button>

          <button
            onClick={() => onFilterChange({ page: totalPages })}
            disabled={filters.page === totalPages || isLoading}
            aria-label={LABELS.lastPage}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronsRightSVG className="h-4 w-4" />
          </button>

        </div>
      </div>

    </div>
  );
};