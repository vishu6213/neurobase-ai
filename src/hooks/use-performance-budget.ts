"use client";

import { useState, useEffect } from "react";

export function usePerformanceBudget() {
  const [isLowPower, setIsLowPower] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkPerformance = () => {
      if (typeof window === "undefined") return;

      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ""
      );
      const isSmallScreen = window.innerWidth < 768;
      const hasTouch = 
        "ontouchstart" in window || 
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

      const mobile = mobileUA || isSmallScreen || (hasTouch && window.innerWidth < 1024);
      
      setIsMobile(mobile);
      setIsLowPower(mobile);
    };

    checkPerformance();
    window.addEventListener("resize", checkPerformance, { passive: true });
    return () => window.removeEventListener("resize", checkPerformance);
  }, []);

  return {
    isMobile: mounted ? isMobile : false,
    isLowPower: mounted ? isLowPower : false,
    mounted,
  };
}
