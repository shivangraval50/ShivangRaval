"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const PARAGRAPHS = [
  <>
    I&apos;m an <strong className="font-semibold text-ink-primary">AI/ML Engineer</strong> currently pursuing my Master&apos;s
    in Computer Science at Northeastern University, with deep specialization in production machine learning
    systems and quantitative finance.
  </>,
  <>
    On the <strong className="font-semibold text-ink-primary">AI &amp; ML Engineering</strong> side, I architect production
    systems that scale — recently leading a team of 20 engineers at Webearl AI, where we built inference
    platforms serving 100K+ daily requests with sub-500ms latency. I&apos;ve built RAG systems with sub-10ms
    cached response times and distributed training infrastructure with real, measured parallel-processing
    speedups — multi-GPU scaling is the work in progress.
  </>,
  <>
    As a <strong className="font-semibold text-ink-primary">Quant Developer</strong>, I bring that same production rigor to
    trading infrastructure operating at microsecond precision — from statistical arbitrage strategies to
    low-latency market simulators processing millions of events per second.
  </>,
  <>
    My stack spans the full spectrum: <strong className="font-semibold text-ink-primary">PyTorch</strong> for ML
    modeling, <strong className="font-semibold text-ink-primary">LangChain</strong> for LLM applications, and{" "}
    <strong className="font-semibold text-ink-primary">Kubernetes</strong> for orchestration, down to{" "}
    <strong className="font-semibold text-ink-primary">Python, C++, and OCaml</strong> for core systems. I&apos;m passionate
    about the intersection where engineering rigor meets quantitative depth.
  </>,
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        /* Outer container matches every other section so the left edge is
           shared (HIG "Layout": align components with one another); the inner
           measure keeps prose at ~68 characters rather than the 110 the old
           max-w-4xl produced. */
        className="mx-auto max-w-6xl"
      >
        <motion.p variants={fadeUp} className="eyebrow mb-3">
          <span className="text-ink-tertiary">$</span> cat about.md
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mb-8 max-w-[40rem] text-[2rem] font-semibold tracking-title text-ink-primary sm:text-[2.5rem]"
        >
          About Me
        </motion.h2>

        <div className="max-w-[40rem] space-y-6 text-[1.0625rem] leading-[1.6] text-ink-secondary sm:text-[1.125rem]">
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
