"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

interface PickerProps {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

function isoToDateObject(iso: string | undefined): DateObject | undefined {
  if (!iso) return undefined;
  return new DateObject({
    date: new Date(iso),
    calendar: persian,
    locale: persian_fa,
  });
}

function dateObjectToIso(d: DateObject): string {
  const g = d.toDate();
  return `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, "0")}-${String(g.getDate()).padStart(2, "0")}`;
}

function formatDisplay(value: DateRange): string {
  const fmt = (iso: string) => {
    const d = isoToDateObject(iso);
    return d ? d.format("YYYY/MM/DD") : "";
  };
  if (value.from && value.to) return `${fmt(value.from)}  —  ${fmt(value.to)}`;
  if (value.from) return `از ${fmt(value.from)}`;
  return "انتخاب بازه تاریخ";
}

export const PersianDateRangePicker: React.FC<PickerProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const has = !!(value.from || value.to);

  const pickerValue: DateObject[] = [
    isoToDateObject(value.from),
    isoToDateObject(value.to),
  ].filter(Boolean) as DateObject[];

  const handleChange = (dates: DateObject[]) => {
    if (!dates || dates.length === 0) {
      onChange({ from: undefined, to: undefined });
    } else if (dates.length === 1) {
      onChange({ from: dateObjectToIso(dates[0]), to: undefined });
    } else {
      onChange({
        from: dateObjectToIso(dates[0]),
        to: dateObjectToIso(dates[1]),
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block" dir="rtl">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all cursor-pointer whitespace-nowrap
          ${open ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 " : ""}
          ${
            has
              ? "border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
      >
        <svg
          className="h-4 w-4 flex-shrink-0 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="max-w-[260px] truncate font-medium">
          {formatDisplay(value)}
        </span>
        {has && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange({ from: undefined, to: undefined });
            }}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (e.stopPropagation(),
              onChange({ from: undefined, to: undefined }))
            }
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 flex-shrink-0"
            aria-label="پاک کردن"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        )}
      </button>

      {/* Inline Calendar — فقط وقتی open است */}
      {open && (
        <div className="absolute top-full mt-2 z-[60] right-0 rmdp-wrapper-custom">
          <Calendar
            value={pickerValue}
            onChange={handleChange}
            range
            rangeHover
            numberOfMonths={2}
            calendar={persian}
            locale={persian_fa}
            className="rmdp-prime"
          />
          {/* دکمه‌های اعمال / پاک کردن */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
            <button
              onClick={() => onChange({ from: undefined, to: undefined })}
              className="text-xs px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              پاک کردن
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={!value.from || !value.to}
              className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              اعمال
            </button>
          </div>
        </div>
      )}

      <style>{`
        .rmdp-wrapper-custom .rmdp-wrapper {
          direction: rtl;
          font-family: inherit;
          border-radius: 1rem 1rem 0 0;
          border: 1px solid #e2e8f0;
          border-bottom: none;
          box-shadow: 0 20px 25px -5px rgb(0 0 0/.1), 0 8px 10px -6px rgb(0 0 0/.1);
        }
        .dark .rmdp-wrapper-custom .rmdp-wrapper {
          background: #0f172a;
          border-color: #1e293b;
        }
        .dark .rmdp-wrapper-custom .rmdp-header {
          background: #0f172a;
          color: #f1f5f9;
        }
        .dark .rmdp-wrapper-custom .rmdp-day span { color: #cbd5e1; }
        .dark .rmdp-wrapper-custom .rmdp-week-day { color: #64748b; }
        .dark .rmdp-wrapper-custom .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover {
          background: #1e293b;
          color: #f1f5f9;
        }
        .rmdp-wrapper-custom .rmdp-day.rmdp-selected span:not(.highlight) {
          background: #2563eb;
          color: white;
        }
        /* Light Mode */
        .rmdp-header-values {
          color: #111827 !important;
          font-weight: 600;
          font-size: 16px;
        }

        /* Dark Mode */
        .dark .rmdp-header-values {
          color: #f9fafb !important;
        }
          /* Light */
        .rmdp-day.rmdp-range {
          background-color: #2563eb !important;
          color: white !important;
        }

        /* Dark */
        .dark .rmdp-day.rmdp-range {
          background-color: #1d4ed8 !important;
          color: white !important;
        }
        .rmdp-wrapper-custom .rmdp-range { background: #eff6ff; }
        .dark .rmdp-wrapper-custom .rmdp-range { background: #1e3a5f; }
        .rmdp-wrapper-custom .rmdp-arrow-container:hover { background: #eff6ff; }
        .dark .rmdp-wrapper-custom .rmdp-arrow-container:hover { background: #1e293b; }
        .dark .rmdp-wrapper-custom .rmdp-arrow { border-color: #94a3b8; }
        .dark .rmdp-wrapper-custom .rmdp-day.rmdp-today span {
          background: transparent;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};
