"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const STATS = [
  { value: 20, suffix: "", label: "Projects Shipped" },
  { value: 149, suffix: "K", label: "Matched Events / Sec" },
  { value: 2.95, decimals: 2, suffix: "×", label: "Measured Training Speedup" },
  { value: 10, prefix: "<", suffix: "ms", label: "Cached RAG Latency" },
  { value: 66.7, decimals: 1, suffix: "K", label: "Stream Events / Sec" },
  { value: 74.3, decimals: 1, suffix: "%", label: "Order-Fill Improvement" },
];

export default function Stats() {
  return (
    <section className="border-y border-line-subtle bg-void-surface/40 py-14">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:px-8"
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="text-center">
            <div className="text-3xl font-bold text-brand-primary sm:text-4xl">
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>
            <div className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-tertiary">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
