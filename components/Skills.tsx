"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const SKILL_GROUPS = [
  {
    category: "Quantitative Trading",
    items: ["Statistical Arbitrage", "Market Microstructure", "Execution Algorithms", "Kalman Filters", "Backtesting"],
  },
  {
    category: "AI & ML Infrastructure",
    items: ["Distributed Training", "Model Serving", "MLOps", "RLHF", "Production ML"],
  },
  {
    category: "NLP & Applied ML",
    items: ["RAG Systems", "LLM Inference", "Semantic Search", "Entity Resolution", "Content Classification"],
  },
  {
    category: "Systems & Languages",
    items: ["C++", "OCaml", "Low-Latency Systems", "Interpreters & Compilers", "Concurrency"],
  },
];

const CORE_TECH = [
  "Python", "C++", "OCaml", "TypeScript", "PyTorch", "LangChain",
  "Kubernetes", "Docker", "Kafka", "PostgreSQL", "Next.js", "Redis",
];

export default function Skills() {
  return (
    <section id="skills" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-sm text-signal-green">
            <span className="text-ink-tertiary">$</span> cat skills.json
          </p>
          <h2 className="text-4xl font-bold text-ink-primary">Skills & Expertise</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 md:grid-cols-2"
        >
          {SKILL_GROUPS.map((group) => (
            <motion.div
              key={group.category}
              variants={fadeUp}
              className="rounded-2xl border border-line-subtle bg-void-card p-6 transition-colors hover:border-signal-cyan/30"
            >
              <h3 className="mb-4 font-mono text-sm uppercase tracking-wide text-signal-cyan">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg bg-void-elevated px-3 py-1.5 text-sm text-ink-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 text-center"
        >
          <h3 className="mb-6 text-xl font-semibold text-ink-primary">Core Technologies</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CORE_TECH.map((tech) => (
              <motion.span
                key={tech}
                whileHover={{ y: -3 }}
                className="rounded-full border border-line-strong bg-void-elevated px-5 py-2 font-mono text-sm text-ink-primary shadow-sm transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
