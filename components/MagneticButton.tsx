"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  download?: boolean;
  target?: string;
  rel?: string;
}

/**
 * Primary call-to-action link.
 *
 * Previously this tracked the cursor and drifted up to 30% of the pointer
 * offset. HIG "Motion" ("avoid adding motion to UI interactions that occur
 * frequently") and "Pointing devices" (a control should stay where the pointer
 * expects it) both argue against a target that moves away as you aim at it.
 * The name is kept so callers don't change; the feedback is now the system's
 * own: a small scale on hover and a settle on press.
 */
export default function MagneticButton({ href, children, className, download, target, rel }: MagneticButtonProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.a
      href={href}
      download={download}
      target={target}
      rel={rel}
      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.5 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
