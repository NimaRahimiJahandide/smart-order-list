'use client';

import { useEffect, useState, useRef } from 'react';

export function useScrollShrink() {
  const [shrunk, setShrunk] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      // ۱. اگر کاربر به سمت پایین حرکت کرد و از مرز ۱۰ پیکسل رد شد -> هدر کوچک شود
      if (y > lastY.current && y > 10) {
        setShrunk(true);
      } 
      // ۲. هدر فقط و فقط زمانی به حالت بزرگ برمی‌گردد که کاربر کاملاً به بالای صفحه (کمتر از ۵ پیکسل) رسیده باشد
      else if (y <= 5) {
        setShrunk(false);
      }

      lastY.current = y;
    };

    // اضافه کردن passive برای پرفورمنس بهتر و جلوگیری از لگ اسکرول
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return shrunk;
}