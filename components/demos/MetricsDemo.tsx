"use client";

import { motion } from "framer-motion";
import type { MetricsDemo as MetricsDemoData, MetricStatus } from "@/types/project";
import { scaleIn, staggerContainer, viewportOnce, EASE } from "@/lib/motion";

const STATUS_STYLE: Record<MetricStatus, string> = {
  measured: "text-signal-green border-signal-green/30 bg-signal-green/10",
  projected: "text-signal-amber border-signal-amber/30 bg-signal-amber/10",
  stubbed: "text-ink-tertiary border-line-strong bg-void-elevated",
};

export default function MetricsDemo({ data }: { data: MetricsDemoData }) {
  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.metrics.map((m) => (
          <motion.div
            key={m.label}
            variants={scaleIn}
            className="rounded-xl border border-line-subtle bg-void-elevated p-4"
          >
            <div className="font-mono text-xl font-semibold text-signal-cyan sm:text-2xl">{m.value}</div>
            <div className="mt-1 text-xs text-ink-tertiary">{m.label}</div>
            {m.status && (
              <span
                className={`mt-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_STYLE[m.status]}`}
              >
                {m.status}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {data.chart && data.chart.length > 0 && (
        <div className="space-y-3 rounded-xl border border-line-subtle bg-void-elevated p-4">
          {data.chart.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between font-mono text-xs text-ink-secondary">
                <span>{bar.label}</span>
                <span>{bar.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-void">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bar.value}%` }}
                  viewport={viewportOnce}
                  transition={{ duration: 1, ease: EASE }}
                  className="h-full rounded-full bg-gradient-to-r from-signal-cyan to-signal-blue"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
