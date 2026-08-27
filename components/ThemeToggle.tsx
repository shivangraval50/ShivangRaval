"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    /* 44×44 on touch, 36×36 from the medium breakpoint up — HIG "Accessibility"
       control minimums are 44 pt on mobile and 28 pt on desktop. */
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-ink-secondary transition-colors duration-200 hover:bg-ink-primary/[0.06] hover:text-ink-primary md:h-9 md:w-9 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: DUR.micro, ease: EASE }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
