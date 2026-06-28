"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ITEMS_PER_PAGE } from "@/constants/orders";

const EMPTY_STATS: OrderStats = {
  total: 0,
  pending: 0,
  paid: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

export default function OrdersPage() {
  const { filters, setFilters, resetFilters } = useOrderQueryState();

  // حالا فقط سفارشات صفحه فعلی را نگه می‌دارد (نه همه را)
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredStats, setFilteredStats] = useState<OrderStats>(EMPTY_STATS);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // وابستگی‌های دیبانس...
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedStatus = useDebounce(filters.status, 150);
  const debouncedPriority = useDebounce(filters.priority, 150);
  const debouncedDateRange = useDebounce(filters.dateRange, 150);
  const debouncedSortBy = useDebounce(filters.sortBy, 150);
  const debouncedSortOrder = useDebounce(filters.sortOrder, 150);

  const filterKey = JSON.stringify({
    search: debouncedSearch,
    status: debouncedStatus,
    priority: debouncedPriority,
    dateRange: debouncedDateRange,
    sortBy: debouncedSortBy,
    sortOrder: debouncedSortOrder,
    customDateFrom: filters.customDateFrom ?? "",
    customDateTo: filters.customDateTo ?? "",
  });

  // لود صفحه مشخص و جایگزینی کامل داده‌ها
  const loadPage = useCallback(
    async (page: number, replace: boolean = true) => {
      if (isFetching && currentPage === page) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsFetching(true);
      if (replace) setIsInitial(true);
      setError(null);

      try {
        // ایجاد یک پرومیس برای تاخیر تعمدی ۱ ثانیه‌ای
        const delayPromise = new Promise((resolve) =>
          setTimeout(resolve, 1000),
        );

        // اجرای همزمان فچ و تاخیر ۱ ثانیه‌ای
        const [result] = await Promise.all([
          fetchOrders(
            {
              ...filters,
              search: debouncedSearch,
              status: debouncedStatus,
              priority: debouncedPriority,
              dateRange: debouncedDateRange,
              sortBy: debouncedSortBy,
              sortOrder: debouncedSortOrder,
              customDateFrom: filters.customDateFrom,
              customDateTo: filters.customDateTo,
              page,
            },
            controller.signal,
          ),
          delayPromise, // این باعث می‌شود کل فرآیند حداقل ۱ ثانیه طول بکشد
        ]);

        if (controller.signal.aborted) return;

        setAllOrders(result.data);
        setTotalCount(result.totalCount);
        setFilteredStats(result.filteredStats);
        setCurrentPage(page);
        setFilters({ page });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(
          (err as Error).message ||
            "خطای سیستم در هنگام دریافت داده‌ها رخ داد.",
        );
      } finally {
        setIsFetching(false);
        setIsInitial(false);
      }
    },
    [
      filterKey,
      isFetching,
      currentPage,
      filters,
      debouncedSearch,
      debouncedStatus,
      debouncedPriority,
      debouncedDateRange,
      debouncedSortBy,
      debouncedSortOrder,
      setFilters,
    ],
  );

  // ریست و لود مجدد در زمان تغییر فیلترها
  const prevFilterKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    setAllOrders([]);
    setCurrentPage(1);
    loadPage(1, true);
  }, [filterKey, loadPage]);

  // توابع رفتن به صفحه قبل و بعد
  const loadNextPage = useCallback(() => {
    const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);
    if (currentPage < totalPages && !isFetching) {
      loadPage(currentPage + 1, true);
    }
  }, [currentPage, totalCount, isFetching, loadPage]);

  const loadPrevPage = useCallback(() => {
    if (currentPage > 1 && !isFetching) {
      loadPage(currentPage - 1, true);
    }
  }, [currentPage, isFetching, loadPage]);

  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);

  const handleRetry = useCallback(() => {
    setError(null);
    loadPage(currentPage, true);
  }, [currentPage, loadPage]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* ... هدر و استت‌ها تغییری نمی‌کنند ... */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            مدیریت سفارشات
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <DashboardStats stats={filteredStats} isLoading={isInitial} />

      <OrderFiltersComponent
        filters={filters}
        onFilterChange={(updater) => {
          setAllOrders([]);
          setCurrentPage(1);
          setFilters(updater);
        }}
        onReset={() => {
          setAllOrders([]);
          setCurrentPage(1);
          resetFilters();
        }}
        allFilteredOrders={allOrders}
      />

      {error ? (
        // ... بخش نمایش خطا تغییری نمی‌کند ...
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-base font-semibold text-rose-900 dark:text-rose-400">
              خطای اتصال به داده‌ها
            </h3>
            <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      ) : (
        <OrdersTable
          orders={allOrders}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={currentPage < totalPages}
          isFetching={isFetching}
          isInitial={isInitial}
          filters={filters}
          onFilterChange={setFilters}
          onLoadMore={loadNextPage} // به عنوان صفحه بعد عمل می‌کند
          onLoadLess={loadPrevPage} // تابع جدید برای صفحه قبل
          onSelectOrder={setSelectedOrder}
        />
      )}

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}
