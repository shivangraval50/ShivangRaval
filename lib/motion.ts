import type { Variants } from "framer-motion";

/**
 * Motion vocabulary.
 *
 * HIG "Motion": add motion purposefully, aim for brevity and precision, and
 * avoid gratuitous animation. The previous values (0.6–0.8s expo-out, 28–40px
 * travel, per-character staggers) read as showy rather than system-like, so
 * every duration here is shortened and every distance reduced. `EASE` is the
 * curve the system itself uses for view transitions.
 */
export const EASE = [0.32, 0.72, 0, 1] as const;

/** Standard durations, in seconds. Nothing on this site animates for longer. */
export const DUR = {
  micro: 0.16,
  short: 0.24,
  medium: 0.36,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.medium, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.medium, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.short, ease: EASE } },
};

export const staggerContainer = (stagger = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const viewportOnce = { once: true, margin: "-64px" };

/** Press feedback for buttons — the system's own scale-and-settle, tightened. */
export const pressable = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.975 },
  transition: { type: "spring" as const, stiffness: 500, damping: 32, mass: 0.5 },
};
