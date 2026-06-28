'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollShrink() {
  const [shrunk, setShrunk] = useState(false);
  
  // نگهداری آخرین مقدار اسکرول برای تشخیص جهت حرکت
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // دریافت مقدار اسکرول فعلی (پشتیبانی از مرورگرهای مختلف)
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

      // ۱. اگر کاربر به سمت پایین اسکرول کند
      if (currentScrollTop > lastScrollTop.current) {
        // برای اینکه در همان ابتدای صفحه (مثلاً اسکرول کمتر از ۱۰ پیکسل) هدر فوراً غیب نشود
        if (currentScrollTop > 10) {
          setShrunk(true);
        }
      } 
      // ۲. اگر کاربر به سمت بالا اسکرول کند
      else if (currentScrollTop < lastScrollTop.current) {
        setShrunk(false);
      }

      // بروزرسانی مقدار قبلی برای مقایسه در دفعات بعد
      // استفاده از Math.max برای جلوگیری از مقادیر منفی در اسکرول‌های کشسانی (Elastic Scroll در مک و آیفون)
      lastScrollTop.current = Math.max(0, currentScrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return shrunk;
}