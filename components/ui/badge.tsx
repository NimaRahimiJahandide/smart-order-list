import React from "react";

interface BadgeProps {
  variant:
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "low"
    | "medium"
    | "high"
    | "neutral";
  children: React.ReactNode;
}

const labelMap: Record<BadgeProps["variant"], string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  neutral: "عادی",
};

export const Badge: React.FC<BadgeProps> = React.memo(({ variant, children }) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase";

  const variantClass =
    variant === "pending"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
      : variant === "paid" || variant === "low"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
      : variant === "shipped"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
      : variant === "delivered"
      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50"
      : variant === "cancelled" || variant === "high"
      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
      : variant === "medium"
      ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"
      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span className={baseStyles + " " + variantClass}>
      {labelMap[variant]}
    </span>
  );
});

Badge.displayName = "Badge";