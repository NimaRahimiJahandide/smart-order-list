'use client';

import React from 'react';
import { Search, RotateCcw, Download } from 'lucide-react';
import { OrderFilters, OrderStatus, OrderPriority, DateFilterOption, Order } from '@/types/orders';
import { ORDER_STATUSES, ORDER_PRIORITIES } from '@/constants/orders';
import { exportOrdersToCSV } from '../utils/csv-exporter';

interface FilterProps {
  filters: OrderFilters;
  onFilterChange: (updater: Partial<OrderFilters> | ((prev: OrderFilters) => Partial<OrderFilters>)) => void;
  onReset: () => void;
  allFilteredOrders: Order[];
}

export const OrderFiltersComponent: React.FC<FilterProps> = ({ filters, onFilterChange, onReset, allFilteredOrders }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value, page: 1 });
  };

  const toggleStatus = (status: OrderStatus) => {
    onFilterChange((prev) => {
      const isSelected = prev.status.includes(status);
      const nextStatus = isSelected ? prev.status.filter((s) => s !== status) : [...prev.status, status];
      return { status: nextStatus, page: 1 };
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
            aria-label="Search orders"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as DateFilterOption, page: 1 })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Filter by timeline range"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value as OrderPriority | 'all', page: 1 })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Filter by priority degree"
          >
            <option value="all">All Priorities</option>
            {ORDER_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>

          <button
            onClick={() => exportOrdersToCSV(allFilteredOrders)}
            disabled={allFilteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Reset active query filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Multi-Select Badges Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Statuses:</span>
        {ORDER_STATUSES.map((status) => {
          const isActive = filters.status.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-150 border ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
};