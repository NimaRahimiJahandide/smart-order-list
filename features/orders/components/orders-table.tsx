'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from 'lucide-react';
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
    if (filters.sortBy !== field) return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/50 sticky top-0 backdrop-blur-sm z-10">
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Items</th>
              <th
                onClick={() => toggleSort('totalAmount')}
                className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center">Total Amount {renderSortIcon('totalAmount')}</div>
              </th>
              <th
                onClick={() => toggleSort('createdAt')}
                className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center">Created At {renderSortIcon('createdAt')}</div>
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
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
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">No matching tracking data found</p>
                    <p className="text-sm text-slate-400">Broaden your structural constraints or criteria parameters.</p>
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
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">{order.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.email}</div>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant={order.status}>{order.status}</Badge></td>
                  <td className="px-5 py-3.5"><Badge variant={order.priority}>{order.priority}</Badge></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{order.itemsCount}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500"
                      aria-label={`View details for ${order.id}`}
                    >
                      <Eye className="h-4 w-4" />
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
          Page <span className="font-semibold text-slate-800 dark:text-white">{filters.page}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFilterChange({ page: 1 })}
            disabled={filters.page === 1 || isLoading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onFilterChange({ page: Math.max(filters.page - 1, 1) })}
            disabled={filters.page === 1 || isLoading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onFilterChange({ page: Math.min(filters.page + 1, totalPages) })}
            disabled={filters.page === totalPages || isLoading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onFilterChange({ page: totalPages })}
            disabled={filters.page === totalPages || isLoading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};