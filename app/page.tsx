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
import { useScrollShrink } from "@/hooks/use-scroll-shrink";

const EMPTY_STATS: OrderStats = {
  total: 0,
  pending: 0,
  paid: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

const SCROLL_THRESHOLD = 250;

export default function OrdersPage() {
  const { filters, setFilters, resetFilters } = useOrderQueryState();
  const shrunk = useScrollShrink({ threshold: 60, hysteresis: 20 });

  const [currentPage, setCurrentPage] = useState(filters.page);
  const [payload, setPayload] = useState<PaginatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<
    "top" | "bottom" | "initial" | null
  >("initial");

  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  // Measure sticky header height so we can push content down correctly
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

  // ── Debounced filter values ──────────────────────────────────────────────
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

  // ── Core fetch ───────────────────────────────────────────────────────────
  const loadPage = useCallback(
    (page: number, direction: "top" | "bottom" | "initial") => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoadingMore(direction);
      setError(null);

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
      )
        .then((result) => {
          if (controller.signal.aborted) return;
          setPayload(result);
          setCurrentPage(page);
          currentPageRef.current = page;
          setFilters({ page });
          setIsLoadingMore(null);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          setError(err.message || "خطای سیستم در هنگام دریافت داده‌ها رخ داد.");
          setIsLoadingMore(null);
        })
        .finally(() => {
          loadingRef.current = false;
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey],
  );

  // ── Reset to page 1 when filters change ─────────────────────────────────
  const prevFilterKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevFilterKey.current === null) {
      prevFilterKey.current = filterKey;
      loadPage(filters.page, "initial");
      return;
    }
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    loadPage(1, "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalCount = payload?.totalCount ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);
  const totalPagesRef = useRef(totalPages);
  totalPagesRef.current = totalPages;

  const handleRetry = useCallback(() => {
    setError(null);
    loadPage(currentPage, "initial");
  }, [currentPage, loadPage]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
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
          {/* Page header */}
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

          {/* Stats */}
          <div
            className={[
              "transition-all duration-500 ease-in-out overflow-hidden",
              shrunk ? "py-2" : "py-4",
            ].join(" ")}
          >
            <DashboardStats
              stats={payload?.filteredStats ?? EMPTY_STATS}
              isLoading={isLoadingMore === "initial"}
              shrunk={shrunk}
            />
          </div>

          {/* Filters */}
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
              allFilteredOrders={payload?.data ?? []}
              shrunk={shrunk}
            />
          </div>
        </div>
      </div>

      {/* ── Spacer that matches the sticky area height ──────────────────── */}
      <div
        style={{ height: stickyHeight }}
        className="transition-all duration-500 ease-in-out"
        aria-hidden="true"
      />

      {/* ── Scrollable content ───────────────────────────────────────────── */}
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
            orders={payload?.data ?? []}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            filters={filters}
            onFilterChange={setFilters}
            onSelectOrder={setSelectedOrder}
            isFetching={isLoadingMore !== null}
            isInitial={isLoadingMore === "initial"}
            hasMore={currentPage < totalPages}
            onLoadMore={useCallback(() => {
              if (currentPage < totalPages) {
                loadPage(currentPage + 1, "bottom");
              }
            }, [currentPage, totalPages, loadPage])}
            onLoadLess={useCallback(() => {
              if (currentPage > 1) {
                loadPage(currentPage - 1, "top");
              }
            }, [currentPage, loadPage])}
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
