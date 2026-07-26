"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ value, decimals = 0, prefix = "", suffix = "", className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!isInView) return;
    if (prefersReduced || !ref.current) {
      if (ref.current) ref.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [isInView, value, decimals, prefix, suffix, prefersReduced, motionValue]);

  return (
    <span ref={ref} className={`font-tabular ${className ?? ""}`}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}
