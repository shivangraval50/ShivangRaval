"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  bullets: string[];
}

const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Research Participant, Multi-Agent Systems & Real-Time AI",
    org: "Google Developer Group (GDG) Cloud Boston · BuildWithAI Workshop",
    period: "2026",
    bullets: [
      "Built production-grade multi-agent architectures on GCP using Google's Agent Development Kit (ADK) and the A2A protocol, with quality control via Vertex AI Evaluation Service and Model Armor.",
      "Engineered a bi-directional streaming agent using the Gemini Live API, Cloud Spanner Graph RAG, and Vertex AI Memory Bank.",
    ],
  },
  {
    role: "AI Engineering Intern → AI Department Manager",
    org: "Webearl AI",
    period: "Jan 2025 – Jun 2025",
    bullets: [
      "Shipped ML inference systems serving 100K+ daily requests at sub-500ms latency; ran studies on model generalization and RLHF reward modeling.",
      "Promoted to lead a 20-engineer research team; diagnosed bottlenecks in large-scale ML pipelines and drove changes that raised research throughput by 50%.",
    ],
  },
  {
    role: "Data Science Intern",
    org: "Tor.ai",
    period: "Jun 2024 – Jul 2024",
    bullets: [
      "Applied regression, ensemble methods, and cross-validation to a forecasting problem, achieving an MAE of 0.12 — 20% better than baseline.",
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 border-t border-line-subtle bg-void-surface px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12"
        >
          <p className="eyebrow mb-3">
            <span className="text-ink-tertiary">$</span> cat experience.log
          </p>
          <h2 className="text-[2rem] font-semibold tracking-title text-ink-primary sm:text-[2.5rem]">
            Experience
          </h2>
        </motion.div>

        <motion.ol
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-[52rem] space-y-4"
        >
          {EXPERIENCE.map((job) => (
            <motion.li
              key={job.role}
              variants={fadeUp}
              /* Content-layer card: opaque, hairline, soft shadow. The 4px neon
                 left rule is gone — HIG "Color" asks for colour that carries
                 meaning, and it carried none. */
              className="rounded-card bg-void-card p-5 shadow-e1 ring-1 ring-inset ring-line-subtle sm:p-7"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-primary/[0.10] text-brand-primary"
                  >
                    <Briefcase size={17} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink-primary sm:text-[1.1875rem]">
                      {job.role}
                    </h3>
                    <p className="mt-0.5 text-[0.9375rem] text-ink-secondary">{job.org}</p>
                  </div>
                </div>
                <span className="whitespace-nowrap pt-1 font-mono text-[0.75rem] tabular-nums text-ink-tertiary">
                  {job.period}
                </span>
              </div>

              <ul className="space-y-2.5">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                    <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-tertiary" />
                    <span className="max-w-[44rem]">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
