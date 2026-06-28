"use client";

import React from "react";
import {
  OrderFilters,
  OrderStatus,
  OrderPriority,
  Order,
} from "@/types/orders";
import { ORDER_STATUSES, ORDER_PRIORITIES } from "@/constants/orders";
import { exportOrdersToCSV } from "../utils/csv-exporter";
import { PersianDateRangePicker, DateRange } from "@/components/ui/persian-date-range-picker";

interface FilterProps {
  filters: OrderFilters;
  onFilterChange: (
    updater:
      | Partial<OrderFilters>
      | ((prev: OrderFilters) => Partial<OrderFilters>),
  ) => void;
  onReset: () => void;
  allFilteredOrders: Order[];
  shrunk?: boolean;
}

const LABELS = {
  search: "جستجو بر اساس نام مشتری یا ایمیل...",
  priority: "اولویت",
  exportCSV: "خروجی CSV",
  reset: "ریست فیلترها",
  statuses: "وضعیت‌ها",
  allPriorities: "همه اولویت‌ها",
} as const;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

export const OrderFiltersComponent: React.FC<FilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  allFilteredOrders,
  shrunk = false,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value, page: 1 });
  };

  const toggleStatus = (status: OrderStatus) => {
    onFilterChange((prev) => {
      const isSelected = prev.status.includes(status);
      const nextStatus = isSelected
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];
      return { status: nextStatus, page: 1 };
    });
  };

  const dateRangeValue: DateRange = {
    from: filters.dateRange === 'custom' ? filters.customDateFrom : undefined,
    to:   filters.dateRange === 'custom' ? filters.customDateTo   : undefined,
  };

  const handleDateChange = (range: DateRange) => {
    if (!range.from && !range.to) {
      onFilterChange({ dateRange: 'all', customDateFrom: undefined, customDateTo: undefined, page: 1 });
    } else {
      onFilterChange({
        dateRange: 'custom',
        customDateFrom: range.from,
        customDateTo: range.to,
        page: 1,
      });
    }
  };

  return (
    <div className={[
      'rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
      'transition-all duration-500 ease-in-out',
      shrunk
        ? 'p-2 shadow-none border-slate-100 dark:border-slate-800/60'
        : 'p-5 shadow-sm space-y-4',
    ].join(' ')}>

      {/* Top row: search + controls */}
      <div className={[
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        'transition-all duration-500',
        shrunk ? 'gap-2' : 'gap-4',
      ].join(' ')}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={[
              'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-500',
              shrunk ? 'h-3.5 w-3.5' : 'h-4 w-4',
            ].join(' ')}
          >
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
          </svg>
          <input
            type="text"
            placeholder={LABELS.search}
            value={filters.search}
            onChange={handleSearchChange}
            className={[
              'w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none',
              'transition-all duration-500 focus:border-blue-500',
              'dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500',
              shrunk ? 'py-1 pl-8 pr-3 text-xs' : 'py-2 pl-10 pr-4 text-sm',
            ].join(' ')}
            aria-label="جستجوی سفارش‌ها"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <PersianDateRangePicker value={dateRangeValue} onChange={handleDateChange} />

          <select
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({ priority: e.target.value as OrderPriority | "all", page: 1 })
            }
            className={[
              'rounded-lg border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer',
              'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-all duration-500',
              shrunk ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
            ].join(' ')}
            aria-label="فیلتر اولویت"
          >
            <option value="all">{LABELS.allPriorities}</option>
            {ORDER_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p === 'low' ? 'کم' : p === 'medium' ? 'متوسط' : 'زیاد'}
              </option>
            ))}
          </select>

          <button
            onClick={() => exportOrdersToCSV(allFilteredOrders)}
            disabled={allFilteredOrders.length === 0}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white font-medium',
              'text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
              'dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all duration-500',
              shrunk ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
            ].join(' ')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={['transition-all duration-500', shrunk ? 'h-3 w-3' : 'h-4 w-4'].join(' ')}>
              <path d="M12 15V3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
            {LABELS.exportCSV}
          </button>

          <button
            onClick={onReset}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50',
              'font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800',
              'dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-all duration-500',
              shrunk ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
            ].join(' ')}
            title={LABELS.reset}
            aria-label={LABELS.reset}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={['transition-all duration-500', shrunk ? 'h-3 w-3' : 'h-4 w-4'].join(' ')}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status filters — hidden when shrunk */}
      <div
        className={[
          'flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/60',
          'transition-all duration-500 ease-in-out overflow-hidden',
          shrunk ? 'max-h-0 opacity-0 pt-0 border-transparent' : 'max-h-20 opacity-100 pt-2',
        ].join(' ')}
      >
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">
          {LABELS.statuses}:
        </span>
        {ORDER_STATUSES.map((status) => {
          const isActive = filters.status.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-150 border cursor-pointer ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
};