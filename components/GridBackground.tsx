"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Immersive backdrop: static grid-paper texture, a cursor-reactive spotlight,
 * and slow-drifting gradient orbs. The spotlight mutates a DOM style directly
 * (not React state) so pointer movement never triggers a re-render.
 */
export default function GridBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = spotlightRef.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [prefersReduced]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_40%,transparent_100%)]" />

      {!prefersReduced && (
        <div
          ref={spotlightRef}
          className="absolute inset-0"
          style={
            {
              "--x": "50%",
              "--y": "30%",
              background:
                "radial-gradient(600px circle at var(--x) var(--y), hsl(var(--brand-primary) / 0.07), transparent 70%)",
            } as React.CSSProperties
          }
        />
      )}

      <motion.div
        className="absolute -left-40 top-[-10%] h-[36rem] w-[36rem] rounded-full bg-signal-blue/10 blur-[120px]"
        animate={prefersReduced ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-signal-violet/10 blur-[120px]"
        animate={prefersReduced ? undefined : { x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] h-[34rem] w-[34rem] rounded-full bg-signal-emerald/[0.06] blur-[130px]"
        animate={prefersReduced ? undefined : { x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
