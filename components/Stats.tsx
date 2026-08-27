"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { PROJECTS } from "@/data/projects";

const STATS = [
  // Derived, so adding a project can't leave this claim stale.
  { value: PROJECTS.length, suffix: "", label: "Projects Shipped" },
  { value: 149, suffix: "K", label: "Matched Events / Sec" },
  { value: 2.95, decimals: 2, suffix: "×", label: "Measured Training Speedup" },
  { value: 10, prefix: "<", suffix: "ms", label: "Cached RAG Latency" },
  { value: 66.7, decimals: 1, suffix: "K", label: "Stream Events / Sec" },
  { value: 74.3, decimals: 1, suffix: "%", label: "Order-Fill Improvement" },
];

export default function Stats() {
  return (
    <section className="border-b border-line-subtle bg-void-surface px-5 py-16 sm:px-8 lg:px-10">
      <motion.dl
        variants={staggerContainer(0.05)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6"
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="text-center">
            {/* HIG "Charting data": the number is the message — give it the
                weight and let the caption recede. Tabular figures so the
                count-up doesn't reflow the row. */}
            <dd className="text-[1.75rem] font-semibold tracking-title text-ink-primary sm:text-[2rem]">
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </dd>
            <dt className="mx-auto mt-1.5 max-w-[9rem] text-[0.8125rem] leading-snug text-ink-tertiary">
              {stat.label}
            </dt>
          </motion.div>
        ))}
      </motion.dl>
    </section>
  );
}
