"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const PARAGRAPHS = [
  <>
    I&apos;m an <strong className="text-ink-primary">AI/ML Engineer</strong> currently pursuing my Master&apos;s
    in Computer Science at Northeastern University, with deep specialization in production machine learning
    systems and quantitative finance.
  </>,
  <>
    On the <strong className="text-ink-primary">AI & ML Engineering</strong> side, I architect production
    systems that scale — recently leading a team of 20 engineers at Webearl AI, where we built inference
    platforms serving 100K+ daily requests with sub-500ms latency. I&apos;ve built RAG systems with sub-10ms
    cached response times and distributed training infrastructure with real, measured parallel-processing
    speedups — multi-GPU scaling is the work in progress.
  </>,
  <>
    As a <strong className="text-ink-primary">Quant Developer</strong>, I bring that same production rigor to
    trading infrastructure operating at microsecond precision — from statistical arbitrage strategies to
    low-latency market simulators processing millions of events per second.
  </>,
  <>
    My stack spans the full spectrum: <strong className="text-ink-primary">PyTorch</strong> for ML
    modeling, <strong className="text-ink-primary">LangChain</strong> for LLM applications, and{" "}
    <strong className="text-ink-primary">Kubernetes</strong> for orchestration, down to{" "}
    <strong className="text-ink-primary">Python, C++, and OCaml</strong> for core systems. I&apos;m passionate
    about the intersection where engineering rigor meets quantitative depth.
  </>,
];

export default function About() {
  return (
    <section id="about" className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-4xl"
      >
        <motion.p variants={fadeUp} className="mb-3 text-center font-mono text-sm text-signal-green">
          <span className="text-ink-tertiary">$</span> cat about.md
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-10 text-center text-4xl font-bold text-ink-primary">
          About Me
        </motion.h2>

        <div className="space-y-5 text-lg leading-relaxed text-ink-secondary">
          {PARAGRAPHS.map((p, i) => (
            <motion.p key={i} variants={fadeUp}>
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
