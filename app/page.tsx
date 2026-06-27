"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useOrderQueryState } from "@/features/orders/hooks/use-order-query-state";
import { useDebounce } from "@/hooks/use-debounce";
import {
  fetchOrders,
  PaginatedResult,
} from "@/features/orders/services/order-service";
import { Order, OrderStats } from "@/types/orders";
import { DashboardStats } from "@/features/orders/components/dashboard-stats";
import { OrderFiltersComponent } from "@/features/orders/components/order-filters";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";

const FALLBACK_STATS: OrderStats = {
  total: 0,
  pending: 0,
  paid: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

export default function OrdersManagementDashboardPage() {
  const { filters, setFilters, resetFilters } = useOrderQueryState();
  const [isPending, startTransition] = useTransition();

  const [payload, setPayload] = useState<PaginatedResult<Order> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const debouncedSearchValue = useDebounce(filters.search, 300);

  useEffect(() => {
    let active = true;

    const executeQueryResolution = () => {
      setError(null);

      const processingFilters = { ...filters, search: debouncedSearchValue };

      fetchOrders(processingFilters)
        .then((result) => {
          if (!active) return;
          setPayload(result);
        })
        .catch((err: Error) => {
          if (!active) return;
          setError(err.message || "خطای سیستم در هنگام دریافت داده‌ها رخ داد.");
        });
    };

    startTransition(() => {
      executeQueryResolution();
    });

    return () => {
      active = false;
    };
  }, [
    debouncedSearchValue,
    filters.status,
    filters.priority,
    filters.dateRange,
    filters.page,
    filters.sortBy,
    filters.sortOrder,
  ]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Header View Block */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            مدیریت سفارشات
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            تحلیل جریان داده‌های تراکنش‌های عملیاتی سازمانی.
          </p>
        </div>
      </header>

      {/* Metrics Dashboard Row */}
      <DashboardStats
        stats={payload?.filteredStats ?? FALLBACK_STATS}
        isLoading={isPending}
      />

      {/* Controls Filters Grid Ecosystem */}
      <OrderFiltersComponent
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        allFilteredOrders={payload?.data ?? []}
      />

      {/* Primary Content Presentation Wrapper Engine */}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex flex-col items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-rose-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>

            <h3 className="text-base font-semibold text-rose-900 dark:text-rose-400">
              خطای اتصال به داده‌ها
            </h3>

            <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md">
              {error}
            </p>

            <button
              onClick={() => setFilters({ ...filters })}
              className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      ) : (
        <OrdersTable
          orders={payload?.data ?? []}
          totalCount={payload?.totalCount ?? 0}
          filters={filters}
          onFilterChange={setFilters}
          isLoading={isPending}
          onSelectOrder={setSelectedOrder}
        />
      )}

      {/* Detailed Operations Registry Focus Engine */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}