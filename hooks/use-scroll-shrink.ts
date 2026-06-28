'use client';

import { useEffect, useState, useRef } from 'react';

interface ScrollShrinkOptions {
  threshold?: number;
  hysteresis?: number;
}

export function useScrollShrink({
  threshold = 60,
  hysteresis = 20,
}: ScrollShrinkOptions = {}) {
  const [shrunk, setShrunk] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (!shrunk && y > threshold) {
        setShrunk(true);
      } else if (shrunk && y < threshold - hysteresis) {
        setShrunk(false);
      }
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [shrunk, threshold, hysteresis]);

  return shrunk;
}