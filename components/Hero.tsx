"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { fadeUp, staggerContainer, EASE, DUR } from "@/lib/motion";
import { PROJECTS } from "@/data/projects";

const ROLES = ["AI/ML Engineer", "Quant Researcher", "Systems Programmer", "MS CS @ Northeastern"];

function RotatingRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROLES.length), 3600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid h-[1.35em] align-bottom">
      {/* invisible stacked copies force the container to the width of the longest role */}
      {ROLES.map((role) => (
        <span key={role} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {role}
        </span>
      ))}
      <AnimatePresence mode="wait">
        <motion.span
          key={ROLES[i]}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: DUR.short, ease: EASE }}
          className="col-start-1 row-start-1 whitespace-nowrap text-ink-secondary"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  return (
    /* No scroll-linked parallax on the hero: HIG "Motion" warns against motion
       that competes with content, and a scroll-driven fade fights the reader. */
    <section
      id="main-content"
      className="relative flex min-h-[88svh] flex-col justify-center px-5 pb-20 pt-24 sm:px-8 sm:pt-28 lg:px-10"
    >
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-y-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-14">
        {/* Text column */}
        <div className="text-center lg:text-left">
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="show"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-4">
              <span className="text-ink-tertiary">$</span> whoami
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mx-auto mb-5 max-w-[30rem] text-[1.1875rem] leading-[1.4] tracking-title text-ink-secondary sm:text-[1.3125rem] lg:mx-0"
            >
              {/* Derived, not spelled out: this line read "Twenty real
                  systems" while PROJECTS held 21, because adding a project
                  silently falsified prose that no count referenced. Every
                  other place the total appears (the CTA below, the grid
                  filters, the ticker, the stats) already derives it. */}
              {PROJECTS.length} real systems you can{" "}
              <span className="text-brand-primary">run yourself</span> — not slides, not screenshots, not
              scripted demos.
            </motion.p>

            {/* Display type: HIG "Typography" — hierarchy comes from size,
                weight and colour, and large type is tightly tracked. */}
            <motion.h1
              variants={fadeUp}
              className="mb-3 text-[2.625rem] font-semibold leading-[1.04] tracking-display text-ink-primary sm:text-[3.25rem] lg:text-[3.75rem]"
            >
              Shivang Raval
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-5 text-[1.0625rem] font-medium leading-snug sm:text-[1.125rem]"
            >
              <RotatingRole />
            </motion.p>

            <motion.div variants={fadeUp} className="mb-6 flex justify-center lg:justify-start">
              {/* Status pill. The pulsing halo that used to sit on the dot was
                  perpetual peripheral motion — removed per HIG "Accessibility". */}
              <span className="inline-flex items-center gap-2 rounded-full bg-signal-green/[0.10] px-3 py-1.5 text-[0.8125rem] font-medium text-signal-green ring-1 ring-inset ring-signal-green/25">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-green" aria-hidden="true" />
                Open to AI/ML &amp; quant engineering roles
              </span>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mx-auto mb-3 max-w-[33rem] text-[1rem] leading-[1.55] text-ink-secondary lg:mx-0"
            >
              Building production ML infrastructure and LLM systems — from distributed training
              platforms to microsecond-precision quantitative trading engines.
            </motion.p>

            <motion.p variants={fadeUp} className="mb-7 text-[0.9375rem] text-ink-tertiary">
              Python · PyTorch · LangChain · Kubernetes · C++ · OCaml
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <MagneticButton
                href="#projects"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-fill px-6 text-[1.0625rem] font-medium text-brand-onfill transition-opacity duration-200 hover:opacity-90"
              >
                View {PROJECTS.length} Projects
              </MagneticButton>
              <MagneticButton
                href="/Shivang_Raval_Resume.pdf"
                download
                className="inline-flex min-h-11 items-center rounded-full px-6 text-[1.0625rem] font-medium text-brand-primary ring-1 ring-inset ring-line-strong transition-colors duration-200 hover:bg-brand-primary/[0.07]"
              >
                Download Resume
              </MagneticButton>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 flex justify-center gap-1 lg:-ml-2.5 lg:justify-start">
              {[
                { icon: Mail, href: "mailto:shivangraval50@gmail.com", label: "Email Shivang Raval" },
                { icon: Linkedin, href: "https://linkedin.com/in/shivang-raval", label: "LinkedIn profile" },
                { icon: Github, href: "https://github.com/shivangraval50", label: "GitHub profile" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-tertiary transition-colors duration-200 hover:bg-ink-primary/[0.06] hover:text-ink-primary"
                >
                  <Icon size={20} strokeWidth={1.75} />
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Portrait. The conic-gradient ring that rotated forever here is gone;
            a hairline ring and a soft shadow do the same job silently. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.medium, delay: 0.08, ease: EASE }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative h-36 w-36 sm:h-48 sm:w-48 lg:h-52 lg:w-52">
            <div className="h-full w-full overflow-hidden rounded-full bg-void-elevated shadow-e2 ring-1 ring-inset ring-ink-primary/10">
              <img
                src="/images/logo1.jpeg"
                alt="Shivang Raval"
                className="h-full w-full object-cover"
                width={480}
                height={480}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll affordance — static. It used to bob on an infinite loop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink-tertiary/50 lg:block"
      >
        <ChevronDown size={22} strokeWidth={1.75} />
      </div>
    </section>
  );
}
