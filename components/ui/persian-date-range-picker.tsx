'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Jalali ↔ Gregorian (pure arithmetic, no deps) ───────────────────────────

function gToJ(gy: number, gm: number, gd: number) {
  let g_d_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  for (let i = 0; i < gm - 1; i++) g_d_no += [31,28,31,30,31,30,31,31,30,31,30,31][i];
  if (gm > 2 && (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0))) g_d_no++;
  g_d_no += gd;
  let j_d_no = g_d_no - 79;
  let j_np = Math.floor(j_d_no / 12053);
  j_d_no %= 12053;
  let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_no / 1461);
  j_d_no %= 1461;
  if (j_d_no >= 366) { jy += Math.floor((j_d_no - 1) / 365); j_d_no = (j_d_no - 1) % 365; }
  let i = 0;
  const jMonthLens = [31,31,31,31,31,31,30,30,30,30,30,29];
  for (; i < 11 && j_d_no >= jMonthLens[i]; i++) j_d_no -= jMonthLens[i];
  return { jy, jm: i + 1, jd: j_d_no + 1 };
}

function jToG(jy: number, jm: number, jd: number) {
  jy += 1595;
  let days = -355779 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4)
    + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const gMonthLens = [0, 31, (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (let i = 1; i <= 12; i++) { gd -= gMonthLens[i]; if (gd <= 0) { gd += gMonthLens[i]; gm = i; break; } }
  return { gy, gm, gd };
}

function jMonthLen(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJLeap(jy) ? 30 : 29;
}

function isJLeap(jy: number) {
  const rem = ((jy - (jy > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682;
  return (rem % 2816) < 682;
}

function firstDow(jy: number, jm: number) {
  const { gy, gm, gd } = jToG(jy, jm, 1);
  const d = new Date(gy, gm - 1, gd).getDay(); 
  return (d + 1) % 7; // شنبه=0 تا جمعه=6
}

function todayJ() {
  const n = new Date();
  return gToJ(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

function isoToJ(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return gToJ(y, m, d);
}

function jToIso(jy: number, jm: number, jd: number) {
  const { gy, gm, gd } = jToG(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2,'0')}-${String(gd).padStart(2,'0')}`;
}

function cmpJ(ay: number, am: number, ad: number, by: number, bm: number, bd: number) {
  return ay !== by ? ay - by : am !== bm ? am - bm : ad - bd;
}

// برای تبدیل مطمئن اعداد انگلیسی به فارسی بدون باگ سیستم‌عامل
function toFaDigit(num: number | string) {
  return String(num).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                'مهر','آبان','آذر','دی','بهمن','اسفند'];
const DAYS   = ['ش','ی','د','س','چ','پ','ج'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface JD { jy: number; jm: number; jd: number; }
export interface DateRange { from: string | undefined; to: string | undefined; }

// ─── MonthGrid ────────────────────────────────────────────────────────────────

interface GridProps {
  jy: number; jm: number;
  from: JD | null; to: JD | null; hovered: JD | null;
  onDay: (j: JD) => void; onHover: (j: JD) => void;
  today: JD;
}

const MonthGrid = React.memo(({ jy, jm, from, to, hovered, onDay, onHover, today }: GridProps) => {
  const fdow = firstDow(jy, jm);
  const len  = jMonthLen(jy, jm);

  // منطق اصلاح شده پیش‌نمایش هاور (Hover Preview)
  let effFrom = from, effTo = to;
  if (from && !to && hovered) {
    const c = cmpJ(hovered.jy, hovered.jm, hovered.jd, from.jy, from.jm, from.jd);
    effFrom = c >= 0 ? from : hovered;
    effTo   = c >= 0 ? hovered : from;
  }

  return (
    <div className="min-w-[220px]">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: fdow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: len }).map((_, i) => {
          const day = i + 1;
          const j: JD = { jy, jm, jd: day };
          const isFrom    = from ? cmpJ(jy, jm, day, from.jy, from.jm, from.jd) === 0 : false;
          const isTo      = to   ? cmpJ(jy, jm, day, to.jy,   to.jm,   to.jd)   === 0 : false;
          const isToday   = cmpJ(jy, jm, day, today.jy, today.jm, today.jd) === 0;
          
          const inRange   = effFrom && effTo
            ? cmpJ(jy, jm, day, effFrom.jy, effFrom.jm, effFrom.jd) > 0 &&
              cmpJ(jy, jm, day, effTo.jy,   effTo.jm,   effTo.jd)   < 0
            : false;
          const isSel = isFrom || isTo;

          let strip = '';
          if (inRange || (isFrom && effTo) || (isTo && effFrom)) {
            strip = 'bg-blue-50 dark:bg-blue-950/40';
          }

          // اصلاح کلاس‌های گوشه گرد بر اساس ساختار RTL (شروع از راست)
          let roundRight = isFrom ? 'rounded-r-full' : '';
          let roundLeft  = isTo   ? 'rounded-l-full' : '';

          let inner = 'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all ';
          if (isSel) {
            inner += 'bg-blue-600 text-white shadow';
          } else if (isToday) {
            inner += 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800';
          } else {
            inner += 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
          }

          return (
            <div key={day} className={`relative flex items-center justify-center h-9 ${strip} ${roundLeft} ${roundRight}`}>
              <span
                className={inner}
                onClick={() => onDay(j)}
                onMouseEnter={() => onHover(j)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onDay(j)}
                aria-label={`${jy}/${jm}/${day}`}
                aria-pressed={isSel}
              >
                {toFaDigit(day)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
MonthGrid.displayName = 'MonthGrid';

// ─── Calendar panel ───────────────────────────────────────────────────────────

interface CalendarProps { value: DateRange; onChange: (r: DateRange) => void; onClose: () => void; }

const PersianRangePicker = ({ value, onChange, onClose }: CalendarProps) => {
  const today = todayJ();
  const initJ = value.from ? isoToJ(value.from) : today;

  const [vy, setVy] = useState(initJ.jy);
  const [vm, setVm] = useState(initJ.jm);
  const [hov, setHov] = useState<JD | null>(null);

  const from = value.from ? isoToJ(value.from) : null;
  const to   = value.to   ? isoToJ(value.to)   : null;

  const m2y = vm === 12 ? vy + 1 : vy;
  const m2m = vm === 12 ? 1 : vm + 1;

  // توابع کنترل دکمه‌ها اصلاح شد تا در RTL جهت دکمه‌ها درست عمل کند
  const prevMonth = () => vm === 1 ? (setVy(y => y-1), setVm(12)) : setVm(m => m-1);
  const nextMonth = () => vm === 12 ? (setVy(y => y+1), setVm(1)) : setVm(m => m+1);

  // اصلاح منطق کلیک برای مدیریت صحیح بازه انتخاب شده
  const onDay = useCallback((j: JD) => {
    if (!from || (from && to)) {
      onChange({ from: jToIso(j.jy, j.jm, j.jd), to: undefined });
    } else {
      const c = cmpJ(j.jy, j.jm, j.jd, from.jy, from.jm, from.jd);
      if (c === 0) { 
        onChange({ from: undefined, to: undefined }); 
      } else if (c > 0) { 
        onChange({ from: jToIso(from.jy, from.jm, from.jd), to: jToIso(j.jy, j.jm, j.jd) }); 
      } else { 
        // اگر کاربر روزی قبل از روز شروع انتخاب کرد، آن را به عنوان تاریخ شروع جدید در نظر می‌گیریم
        onChange({ from: jToIso(j.jy, j.jm, j.jd), to: undefined }); 
      }
    }
  }, [from, to, onChange]);

  const fmtJ = (iso: string | undefined) => {
    if (!iso) return null;
    const j = isoToJ(iso);
    return `${toFaDigit(j.jy)}/${toFaDigit(String(j.jm).padStart(2,'0'))}/${toFaDigit(String(j.jd).padStart(2,'0'))}`;
  };

  const applyPreset = (days: number) => {
    const now = new Date();
    const past = new Date(now); past.setDate(past.getDate() - days);
    const t = gToJ(now.getFullYear(), now.getMonth()+1, now.getDate());
    const f = gToJ(past.getFullYear(), past.getMonth()+1, past.getDate());
    onChange({ from: jToIso(f.jy, f.jm, f.jd), to: jToIso(t.jy, t.jm, t.jd) });
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 w-max select-none z-50"
      onMouseLeave={() => setHov(null)}
      dir="rtl"
    >
      {/* Header text info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2.5 py-1 rounded-lg border font-medium text-sm transition-colors ${value.from ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
            {fmtJ(value.from) ?? 'از تاریخ'}
          </span>
          <span className="text-slate-400 text-xs">تا</span>
          <span className={`px-2.5 py-1 rounded-lg border font-medium text-sm transition-colors ${value.to ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
            {fmtJ(value.to) ?? 'تا تاریخ'}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Month navigation controls */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" aria-label="ماه قبل">
          <svg className="h-4 w-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <div className="flex gap-14 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="w-24 text-center">{MONTHS[vm-1]} {toFaDigit(vy)}</span>
          <span className="w-24 text-center">{MONTHS[m2m-1]} {toFaDigit(m2y)}</span>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" aria-label="ماه بعد">
          <svg className="h-4 w-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
      </div>

      {/* Two-month grid layout */}
      <div className="flex gap-6">
        <MonthGrid jy={vy} jm={vm} from={from} to={to} hovered={hov} onDay={onDay} onHover={setHov} today={today}/>
        <div className="w-px bg-slate-100 dark:bg-slate-800 self-stretch"/>
        <MonthGrid jy={m2y} jm={m2m} from={from} to={to} hovered={hov} onDay={onDay} onHover={setHov} today={today}/>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 gap-4">
        <div className="flex gap-1.5 flex-wrap max-w-xs">
          {[7, 30, 90].map(days => (
            <button key={days} onClick={() => applyPreset(days)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {toFaDigit(days)} روز اخیر
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onChange({ from: undefined, to: undefined })}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            پاک کردن
          </button>
          <button onClick={onClose} disabled={!value.from || !value.to}
            className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            اعمال
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Trigger / wrapper ────────────────────────────────────────────────────────

interface PickerProps { value: DateRange; onChange: (r: DateRange) => void; }

export const PersianDateRangePicker = ({ value, onChange }: PickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fmtDisplay = () => {
    const fmt = (iso: string) => {
      const j = isoToJ(iso);
      return `${toFaDigit(j.jy)}/${toFaDigit(String(j.jm).padStart(2,'0'))}/${toFaDigit(String(j.jd).padStart(2,'0'))}`;
    };
    if (value.from && value.to) return `${fmt(value.from)}  —  ${fmt(value.to)}`;
    if (value.from) return `از ${fmt(value.from)}`;
    return 'انتخاب بازه تاریخ';
  };

  const has = !!(value.from || value.to);

  return (
    <div ref={ref} className="relative inline-block" dir="rtl">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all cursor-pointer whitespace-nowrap
          ${open ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 ' : ''}
          ${has
            ? 'border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
      >
        <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/>
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span className="max-w-[260px] truncate font-medium">{fmtDisplay()}</span>
        {has && (
          <span
            role="button" tabIndex={0}
            onClick={e => { e.stopPropagation(); onChange({ from: undefined, to: undefined }); }}
            onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), onChange({ from: undefined, to: undefined }))}
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 flex-shrink-0"
            aria-label="پاک کردن"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 z-[60] right-0 shadow-xl">
          <PersianRangePicker value={value} onChange={onChange} onClose={() => setOpen(false)}/>
        </div>
      )}
    </div>
  );
};