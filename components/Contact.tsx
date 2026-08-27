"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github, MapPin } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-line-subtle bg-void-surface px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
    >
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-[38rem] text-center"
      >
        <motion.p variants={fadeUp} className="eyebrow mb-3">
          <span className="text-ink-tertiary">$</span> ./contact --reach-out
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mb-5 text-[2.25rem] font-semibold tracking-display text-ink-primary sm:text-[3rem]"
        >
          Let&apos;s Build Something
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mb-10 text-[1.125rem] leading-[1.5] text-ink-secondary sm:text-[1.25rem]"
        >
          Whether you&apos;re looking for quantitative trading expertise, ML engineering, or technical
          leadership — I&apos;d love to hear from you.
        </motion.p>

        <motion.div variants={fadeUp} className="mb-10 flex justify-center">
          <MagneticButton
            href="mailto:shivangraval50@gmail.com"
            className="inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full bg-brand-fill px-6 text-[1rem] font-medium text-brand-onfill transition-opacity duration-200 hover:opacity-90 sm:text-[1.0625rem]"
          >
            <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">shivangraval50@gmail.com</span>
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mb-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8"
        >
          <a
            href="https://linkedin.com/in/shivang-raval"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full px-3 text-[0.9375rem] text-ink-secondary transition-colors duration-200 hover:text-brand-primary"
          >
            <Linkedin size={18} strokeWidth={1.75} aria-hidden="true" /> linkedin.com/in/shivang-raval
          </a>
          <a
            href="https://github.com/shivangraval50"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full px-3 text-[0.9375rem] text-ink-secondary transition-colors duration-200 hover:text-brand-primary"
          >
            <Github size={18} strokeWidth={1.75} aria-hidden="true" /> github.com/shivangraval50
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5 text-[0.9375rem] text-ink-tertiary">
          <p className="flex items-center justify-center gap-2">
            <MapPin size={15} strokeWidth={1.75} aria-hidden="true" /> Boston, MA
          </p>
          <p>Currently: MS CS @ Northeastern University</p>
          <p className="pt-2 text-ink-secondary">
            Open to: ML Engineering · AI Research · MLOps · Quantitative Trading
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
