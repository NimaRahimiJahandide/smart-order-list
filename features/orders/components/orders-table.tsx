"use client";

import React, { useRef, useEffect } from "react";
import { Order, OrderFilters } from "@/types/orders";
import { ORDER_STATUS_LABELS, ORDER_PRIORITY_LABELS } from "@/constants/orders";
import { Badge } from "@/components/ui/badge";

interface TableProps {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isFetching: boolean;
  isInitial: boolean;
  filters: OrderFilters;
  onFilterChange: (
    updater:
      | Partial<OrderFilters>
      | ((prev: OrderFilters) => Partial<OrderFilters>),
  ) => void;
  onLoadMore: () => void; // رفتن به صفحه بعد
  onLoadLess: () => void; // رفتن به صفحه قبل
  onSelectOrder: (order: Order) => void;
}

/* ── Icons (بدون تغییر) ────────────────────────────────────────────────── */
const ArrowUpDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </svg>
);
const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ── بنر کوچک وضعیت در حال بارگذاری ────────────────────────────────────────── */
const LoadingIndicator = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center gap-2 py-3 bg-blue-50/50 dark:bg-blue-950/20 text-xs font-medium text-blue-600 dark:text-blue-400 border-b border-t border-slate-100 dark:border-slate-800">
    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
    {text}
  </div>
);

const SkeletonRows = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} aria-hidden="true">
        {Array.from({ length: 8 }).map((_, j) => (
          <td key={j} className="px-5 py-4">
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
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
  currentPage,
  totalPages,
  hasMore,
  isFetching,
  isInitial,
  filters,
  onFilterChange,
  onLoadMore,
  onLoadLess,
  onSelectOrder,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef<number>(0);
  const skipScrollCheck = useRef<boolean>(false);

  useEffect(() => {
    // اگر جدول در حال لود شدن است، کاری انجام نده
    if (!scrollContainerRef.current || isFetching) return;

    const container = scrollContainerRef.current;

    // شرط جدید: اگر اولین لود کامپوننت است، اسکرول را روی صفر (بالا) تنظیم کن
    if (!isComponentMounted.current) {
      isComponentMounted.current = true;
      skipScrollCheck.current = true;
      container.scrollTop = 0;
      return;
    }

    // اگر به صفحه بعد رفتیم (اسکرول به پایین بوده)، اسکرول را ببر بالا
    if (lastScrollTop.current > 0 && container.scrollTop > 0) {
      skipScrollCheck.current = true;
      container.scrollTop = 5;
    }
    // اگر به صفحه قبل رفتیم (اسکرول به بالا بوده)، اسکرول را ببر پایین
    else if (lastScrollTop.current === 0) {
      skipScrollCheck.current = true;
      container.scrollTop = container.scrollHeight - container.clientHeight - 5;
    }
  }, [currentPage, isFetching]);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isComponentMounted = useRef<boolean>(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isFetching || isInitial || orders.length === 0) return;
    if (skipScrollCheck.current) {
      skipScrollCheck.current = false;
      return;
    }

    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // ۱. برای اینکه دقیقاً به چسبیده ترین حالت آخر جدول برسد، آستانه را روی ۱ پیکسل می‌گذاریم
    const threshold = 1;

    // اگر تایمر قبلی وجود دارد آن را پاک می‌کنیم (مکانیزم دبانس برای مکس کوتاه)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // ۲. تشخیص رسیدن به انتهای مطلق جدول (صفحه بعد)
    if (
      scrollTop > lastScrollTop.current &&
      scrollHeight - clientHeight - scrollTop <= threshold
    ) {
      if (currentPage < totalPages) {
        // ایجاد یک مکس بصری ۴۰۰ میلی‌ثانیه‌ای قبل از تریگر لودینگ
        scrollTimeoutRef.current = setTimeout(() => {
          lastScrollTop.current = scrollTop;
          onLoadMore();
        }, 400);
      }
    }
    // ۳. تشخیص رسیدن به ابتدای مطلق جدول (صفحه قبل)
    else if (scrollTop < lastScrollTop.current && scrollTop <= threshold) {
      if (currentPage > 1) {
        // ایجاد یک مکس بصری ۴۰۰ میلی‌ثانیه‌ای قبل از تریگر لودینگ
        scrollTimeoutRef.current = setTimeout(() => {
          lastScrollTop.current = 0;
          onLoadLess();
        }, 400);
      }
    }

    lastScrollTop.current = scrollTop;
  };

  // برای جلوگیری از Memory Leak، در صورت Unmount شدن کامپوننت تایمر را پاک می‌کنیم
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // هر زمان فیلترها تغییر کرد، وضعیت کامپوننت را برای اسکرول ریست کن تا از بالا شروع شود
  useEffect(() => {
    isComponentMounted.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [filters]);

  const toggleSort = (field: SortableField) => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      onFilterChange({ sortBy: field, sortOrder: "desc" });
    }
  };

  const SortIcon = ({ field }: { field: SortableField }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDownIcon className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === "asc" ? (
      <ArrowUpIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    ) : (
      <ArrowDownIcon className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
    );
  };

  const thBase =
    "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  return (
    // افزودن موقعیت relative برای کنترل لایه لودینگ اوورلی
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
      {/* ── لایه اورلی لودینگ ۱ ثانیه‌ای هوشمند ── */}
      {isFetching && !isInitial && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] transition-all duration-300">
          <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
            {/* کامپوننت Spinner متحرک */}
            <svg
              className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
              در حال دریافت اطلاعات...
            </span>
          </div>
        </div>
      )}

      {/* بخش هدر ثابت بالای جدول */}
      <div className="flex justify-between items-center px-5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <span>
          صفحه {currentPage.toLocaleString("fa-IR")} از{" "}
          {totalPages.toLocaleString("fa-IR")}
        </span>
        <span>کل سفارشات: {totalCount.toLocaleString("fa-IR")}</span>
      </div>

      {/* کانتینر اصلی اسکرول (با ارتفاع بلندتر ۸۰۰ پیکسلی) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto overflow-y-auto max-h-[70vh] scroll-smooth transition-all duration-300"
        
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
                    ? filters.sortOrder === "asc"
                      ? "ascending"
                      : "descending"
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
                    ? filters.sortOrder === "asc"
                      ? "ascending"
                      : "descending"
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
              <SkeletonRows />
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
                    $
                    {order.totalAmount.toLocaleString("en-US", {
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isInitial && !hasMore && orders.length > 0 && (
        <div className="flex items-center justify-center py-2.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-400 dark:text-slate-500 select-none">
            ✦ پایان لیست · انتقال به صفحات بالاتر با اسکرول معکوس
          </span>
        </div>
      )}
    </div>
  );
};
