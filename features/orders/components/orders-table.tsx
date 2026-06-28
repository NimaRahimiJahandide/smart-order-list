"use client";

import React, { useRef, useLayoutEffect, useEffect } from "react";
import { Order, OrderFilters } from "@/types/orders";
import { ORDER_STATUS_LABELS, ORDER_PRIORITY_LABELS } from "@/constants/orders";
import { Badge } from "@/components/ui/badge";

interface TableProps {
  orders: Order[];
  totalCount: number;
  minPage: number;
  maxPage: number;
  totalPages: number;
  isInitial: boolean;
  isFetchingNext: boolean;
  isFetchingPrev: boolean;
  filters: OrderFilters;
  onFilterChange: (
    updater:
      | Partial<OrderFilters>
      | ((prev: OrderFilters) => Partial<OrderFilters>),
  ) => void;
  onLoadMore: () => void;
  onLoadPrev: () => void;
  onSelectOrder: (order: Order) => void;
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
const ArrowUpDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </svg>
);
const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ── Skeleton ────────────────────────────────────────────────────────────── */

// عرض هر ستون متناسب با محتوای واقعی‌اش
const SKELETON_COL_WIDTHS = [
  'w-24',  // شناسه   — mono کوتاه
  'w-36',  // مشتری   — نام + ایمیل
  'w-20',  // وضعیت   — badge
  'w-16',  // اولویت  — badge کوچک
  'w-8',   // آیتم‌ها  — عدد
  'w-16',  // مبلغ     — عدد با دسیمال
  'w-20',  // تاریخ    — string
  'w-6',   // عملیات  — آیکون
];

const SkeletonRows = ({
  count,
  position = 'bottom',
}: {
  count: number;
  position?: 'top' | 'bottom';
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr
        key={`sk-${position}-${i}`}
        aria-hidden="true"
        style={{
          opacity: 0,
          animation: `skFadeIn 280ms ease forwards`,
          animationDelay: `${i * 35}ms`,
        }}
      >
        {SKELETON_COL_WIDTHS.map((w, j) => (
          <td key={j} className="px-5 py-[15px]">
            <div
              className={`h-3 ${w} mx-auto rounded-full bg-slate-100 dark:bg-slate-800`}
              style={{
                // pulse با تاخیر کمی متفاوت برای هر سلول — حرکت موج‌وار
                animation: `pulse 1.6s ease-in-out infinite`,
                animationDelay: `${(i * SKELETON_COL_WIDTHS.length + j) * 60}ms`,
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

type SortableField = "createdAt" | "totalAmount";

export const OrdersTable: React.FC<TableProps> = ({
  orders,
  totalCount,
  minPage,
  maxPage,
  totalPages,
  isInitial,
  isFetchingNext,
  isFetchingPrev,
  filters,
  onFilterChange,
  onLoadMore,
  onLoadPrev,
  onSelectOrder,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingTopCompRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (pendingTopCompRef.current) {
      const newHeight = el.scrollHeight;
      const diff = newHeight - prevScrollHeightRef.current;
      if (diff !== 0) el.scrollTop += diff;
      if (!isFetchingPrev) pendingTopCompRef.current = false;
    }

    prevScrollHeightRef.current = el.scrollHeight;
  }, [orders, isFetchingPrev]);

  useEffect(() => {
    if (isInitial && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      pendingTopCompRef.current = false;
    }
  }, [isInitial]);

  const EDGE = 300;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isInitial || orders.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (!isFetchingNext && maxPage < totalPages) {
      if (scrollHeight - clientHeight - scrollTop < EDGE) onLoadMore();
    }

    if (!isFetchingPrev && minPage > 1) {
      if (scrollTop < EDGE) {
        pendingTopCompRef.current = true;
        onLoadPrev();
      }
    }
  };

  const toggleSort = (field: SortableField) => {
    if (filters.sortBy === field) {
      onFilterChange({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" });
    } else {
      onFilterChange({ sortBy: field, sortOrder: "desc" });
    }
  };

  const SortIcon = ({ field }: { field: SortableField }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDownIcon className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === "asc"
      ? <ArrowUpIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
      : <ArrowDownIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />;
  };

  const thBase =
    "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto overflow-y-auto max-h-[75vh] scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-full text-right border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-[0_1px_0_0_rgba(226,232,240,1)] dark:shadow-[0_1px_0_0_rgba(51,65,85,1)]">
            <tr>
              <th className={`${thBase} text-center`}>شناسه</th>
              <th className={`${thBase} text-center`}>مشتری</th>
              <th className={`${thBase} text-center`}>وضعیت</th>
              <th className={`${thBase} text-center`}>اولویت</th>
              <th className={`${thBase} text-center`}>آیتم‌ها</th>
              <th
                className={`${thBase} text-center cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200`}
                onClick={() => toggleSort("totalAmount")}
                aria-sort={
                  filters.sortBy === "totalAmount"
                    ? filters.sortOrder === "asc" ? "ascending" : "descending"
                    : "none"
                }
              >
                <div className="inline-flex items-center justify-center">
                  مبلغ کل <SortIcon field="totalAmount" />
                </div>
              </th>
              <th
                className={`${thBase} text-center cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200`}
                onClick={() => toggleSort("createdAt")}
                aria-sort={
                  filters.sortBy === "createdAt"
                    ? filters.sortOrder === "asc" ? "ascending" : "descending"
                    : "none"
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
            {isInitial ? (
              // لود اولیه — skeleton کامل
              <SkeletonRows count={10} position="bottom" />
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
              <>
                {/* skeleton بالا — لود صفحه قبل */}
                {isFetchingPrev && <SkeletonRows count={5} position="top" />}

                {orders.map((order) => (
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
                      <Badge variant={order.status}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={order.priority}>
                        {ORDER_PRIORITY_LABELS[order.priority]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400 text-center">
                      {order.itemsCount}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white text-center">
                      ${order.totalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 text-center">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
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
                ))}

                {/* skeleton پایین — لود صفحه بعد */}
                {isFetchingNext && <SkeletonRows count={5} position="bottom" />}
              </>
            )}
          </tbody>
        </table>
      </div>

      {!isInitial && maxPage >= totalPages && orders.length > 0 && (
        <div className="flex items-center justify-center py-2.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-400 dark:text-slate-500 select-none">
            ✦ پایان لیست
          </span>
        </div>
      )}

      <style>{`
        @keyframes skFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};