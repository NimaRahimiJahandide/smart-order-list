"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useOrderQueryState } from "@/features/orders/hooks/use-order-query-state";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchOrders } from "@/features/orders/services/order-service";
import { Order, OrderStats } from "@/types/orders";
import { DashboardStats } from "@/features/orders/components/dashboard-stats";
import { OrderFiltersComponent } from "@/features/orders/components/order-filters";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ITEMS_PER_PAGE } from "@/constants/orders";
import { useScrollShrink } from "@/hooks/use-scroll-shrink";

const EMPTY_STATS: OrderStats = {
  total: 0,
  pending: 0,
  paid: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

// ── پنجره sliding: حداکثر ۲ صفحه در حافظه ──────────────────────────────
const WINDOW_SIZE = 2;

export default function OrdersPage() {
  const { filters, setFilters, resetFilters } = useOrderQueryState();
  const shrunk = useScrollShrink();

  /**
   * به‌جای یک آرایه انباشته، یک Map نگه می‌داریم:
   *   pageCache: Map<pageNumber, Order[]>
   * و از minPage/maxPage فقط برای تعیین بازه نمایش استفاده می‌کنیم.
   * orders نهایی = مقادیر Map مرتب‌شده بر اساس کلید.
   */
  const [pageCache, setPageCache] = useState<Map<number, Order[]>>(new Map());
  const [minPage, setMinPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isInitial, setIsInitial] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [isFetchingPrev, setIsFetchingPrev] = useState(false);

  const loadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const stickyRef = useRef<HTMLDivElement>(null);
  const [stickyHeight, setStickyHeight] = useState(0);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStickyHeight(el.offsetHeight));
    ro.observe(el);
    setStickyHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

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

  const buildQuery = useCallback(
    (page: number) => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey],
  );

  // ── helper: آرایه سفارشات از cache بر اساس minPage/maxPage ─────────────
  const buildOrdersFromCache = useCallback(
    (cache: Map<number, Order[]>, min: number, max: number): Order[] => {
      const result: Order[] = [];
      for (let p = min; p <= max; p++) {
        const page = cache.get(p);
        if (page) result.push(...page);
      }
      return result;
    },
    [],
  );

  // ── لود اولیه / تغییر فیلتر ─────────────────────────────────────────────
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadingRef.current = true;

    setIsInitial(true);
    setError(null);

    const anchorPage = filters.page > 0 ? filters.page : 1;

    fetchOrders(buildQuery(anchorPage), controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        const newCache = new Map<number, Order[]>();
        newCache.set(anchorPage, result.data);
        setPageCache(newCache);
        setTotalCount(result.totalCount);
        setStats(result.filteredStats);
        setMinPage(anchorPage);
        setMaxPage(anchorPage);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message || "خطای سیستم در هنگام دریافت داده‌ها رخ داد.");
      })
      .finally(() => {
        loadingRef.current = false;
        setIsInitial(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);

  // ── لود صفحه بعد → sliding window به جلو ────────────────────────────────
  const loadNext = useCallback(() => {
    if (loadingRef.current || maxPage >= totalPages) return;
    loadingRef.current = true;
    setIsFetchingNext(true);

    const nextPage = maxPage + 1;

    fetchOrders(buildQuery(nextPage))
      .then((result) => {
        setPageCache((prev) => {
          const updated = new Map(prev);
          updated.set(nextPage, result.data);

          // حذف صفحه‌های خارج از window از انتهای پشتی
          const newMin = nextPage - WINDOW_SIZE + 1;
          for (const key of updated.keys()) {
            if (key < newMin) updated.delete(key);
          }
          return updated;
        });
        setTotalCount(result.totalCount);
        setStats(result.filteredStats);
        setMaxPage(nextPage);
        setMinPage((prev) => Math.max(prev, nextPage - WINDOW_SIZE + 1));
        setFilters((prev) => ({ ...prev, page: nextPage }));
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
        setIsFetchingNext(false);
      });
  }, [maxPage, totalPages, buildQuery, setFilters]);

  // ── لود صفحه قبل → sliding window به عقب ────────────────────────────────
  const loadPrev = useCallback(() => {
    if (loadingRef.current || minPage <= 1) return;
    loadingRef.current = true;
    setIsFetchingPrev(true);

    const prevPage = minPage - 1;

    fetchOrders(buildQuery(prevPage))
      .then((result) => {
        setPageCache((prev) => {
          const updated = new Map(prev);
          updated.set(prevPage, result.data);

          // حذف صفحه‌های خارج از window از انتهای جلویی
          const newMax = prevPage + WINDOW_SIZE - 1;
          for (const key of updated.keys()) {
            if (key > newMax) updated.delete(key);
          }
          return updated;
        });
        setTotalCount(result.totalCount);
        setStats(result.filteredStats);
        setMinPage(prevPage);
        setMaxPage((prev) => Math.min(prev, prevPage + WINDOW_SIZE - 1));
        setFilters((prev) => ({ ...prev, page: prevPage }));
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
        setIsFetchingPrev(false);
      });
  }, [minPage, buildQuery, setFilters]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsInitial(true);
    loadingRef.current = true;

    fetchOrders(buildQuery(minPage))
      .then((result) => {
        const newCache = new Map<number, Order[]>();
        newCache.set(minPage, result.data);
        setPageCache(newCache);
        setTotalCount(result.totalCount);
        setStats(result.filteredStats);
        setMaxPage(minPage);
      })
      .catch((err: Error) => setError(err.message || "خطای سیستم"))
      .finally(() => {
        loadingRef.current = false;
        setIsInitial(false);
      });
  }, [buildQuery, minPage]);

  // ── orders نهایی از cache ────────────────────────────────────────────────
  const orders = buildOrdersFromCache(pageCache, minPage, maxPage);

  return (
    <main className="container min-h-screen mx-auto max-w-7xl px-4 py-8">
      {/* ── Sticky shrinking header zone ────────────────────────────────── */}
      <div
        ref={stickyRef}
        className={[
          "fixed top-0 left-0 right-0 z-40 will-change-transform",
          "transition-all duration-500 ease-in-out",
          shrunk
            ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-800"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <header
            className={[
              "flex items-center justify-between transition-all duration-500 ease-in-out",
              shrunk
                ? "py-2"
                : "py-6 border-b border-slate-200 dark:border-slate-800 mb-0",
            ].join(" ")}
          >
            <h1
              className={[
                "font-extrabold tracking-tight text-slate-900 dark:text-white",
                "transition-all duration-500 ease-in-out",
                shrunk ? "text-lg" : "text-3xl",
              ].join(" ")}
            >
              مدیریت سفارشات
            </h1>
            <ThemeToggle />
          </header>

          <div
            className={[
              "transition-all duration-500 ease-in-out overflow-hidden",
              shrunk ? "py-2" : "py-4",
            ].join(" ")}
          >
            <DashboardStats
              stats={stats}
              isLoading={isInitial}
              shrunk={shrunk}
            />
          </div>

          <div
            className={[
              "transition-all duration-500 ease-in-out",
              shrunk ? "pb-2" : "pb-4",
            ].join(" ")}
          >
            <OrderFiltersComponent
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
              allFilteredOrders={orders}
              shrunk={shrunk}
            />
          </div>
        </div>
      </div>

      <div
        style={{ height: stickyHeight }}
        className="transition-all duration-500 ease-in-out"
        aria-hidden="true"
      />

      <div className="mt-4">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex flex-col items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-rose-500"
                aria-hidden="true"
              >
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
                onClick={handleRetry}
                className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        ) : (
          <OrdersTable
            orders={orders}
            totalCount={totalCount}
            minPage={minPage}
            maxPage={maxPage}
            totalPages={totalPages}
            filters={filters}
            onFilterChange={setFilters}
            onSelectOrder={setSelectedOrder}
            isInitial={isInitial}
            isFetchingNext={isFetchingNext}
            isFetchingPrev={isFetchingPrev}
            onLoadMore={loadNext}
            onLoadPrev={loadPrev}
          />
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}