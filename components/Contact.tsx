"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github, MapPin } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-line-subtle px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black_30%,transparent_100%)]" />

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mx-auto max-w-3xl text-center"
      >
        <motion.p variants={fadeUp} className="mb-3 font-mono text-sm text-signal-green">
          <span className="text-ink-tertiary">$</span> ./contact --reach-out
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-6 text-4xl font-bold text-ink-primary sm:text-5xl">
          Let&apos;s Build Something
        </motion.h2>

        <motion.p variants={fadeUp} className="mb-10 text-xl leading-relaxed text-ink-secondary">
          Whether you&apos;re looking for quantitative trading expertise, ML engineering, or technical
          leadership — I&apos;d love to hear from you.
        </motion.p>

        <motion.div variants={fadeUp} className="mb-10 flex flex-wrap justify-center gap-4">
          <MagneticButton
            href="mailto:shivangraval50@gmail.com"
            className="flex items-center gap-2 rounded-full bg-signal-cyan px-8 py-3 font-medium text-void shadow-[0_0_30px_-8px_rgba(45,212,240,0.6)]"
          >
            <Mail size={18} /> shivangraval50@gmail.com
          </MagneticButton>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-10 flex justify-center gap-6">
          <a
            href="https://linkedin.com/in/shivang-raval"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-secondary transition-colors hover:text-signal-cyan"
          >
            <Linkedin size={20} /> linkedin.com/in/shivang-raval
          </a>
          <a
            href="https://github.com/shivangraval50"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-secondary transition-colors hover:text-signal-cyan"
          >
            <Github size={20} /> github.com/shivangraval50
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-2 font-mono text-sm text-ink-tertiary">
          <p className="flex items-center justify-center gap-2">
            <MapPin size={14} /> Boston, MA
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
