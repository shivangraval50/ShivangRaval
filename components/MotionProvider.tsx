"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
