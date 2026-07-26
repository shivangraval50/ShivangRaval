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
    <section id="experience" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-sm text-signal-green">
            <span className="text-ink-tertiary">$</span> cat experience.log
          </p>
          <h2 className="text-4xl font-bold text-ink-primary">Experience</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-6"
        >
          {EXPERIENCE.map((job) => (
            <motion.div
              key={job.role}
              variants={fadeUp}
              className="rounded-2xl border border-line-subtle border-l-4 border-l-brand-primary bg-void-card p-6 transition-colors hover:border-brand-primary/30"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-void-elevated text-brand-primary">
                    <Briefcase size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug text-ink-primary">{job.role}</h3>
                    <p className="text-sm text-ink-secondary">{job.org}</p>
                  </div>
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-ink-tertiary">{job.period}</span>
              </div>

              <ul className="space-y-2">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-tertiary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
