"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { fadeUp, staggerContainer, EASE } from "@/lib/motion";

const ROLES = ["AI/ML Engineer", "Quant Researcher", "Systems Programmer", "MS CS @ Northeastern"];

function RotatingRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid h-[1.4em] align-bottom">
      {/* invisible stacked copies force the container to the width of the longest role */}
      {ROLES.map((role) => (
        <span key={role} className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {role}
        </span>
      ))}
      <AnimatePresence mode="wait">
        <motion.span
          key={ROLES[i]}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="col-start-1 row-start-1 whitespace-nowrap text-signal-cyan"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = "Shivang Raval".split("");

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col justify-center px-4 pt-24 sm:px-6 lg:px-8">
      <motion.div style={{ y, opacity }} className="mx-auto w-full max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 font-mono text-sm text-signal-green"
        >
          <span className="text-ink-tertiary">$</span> whoami
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-signal-green/30 bg-signal-green/10 px-3 py-1 font-mono text-xs text-signal-green">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-green" />
            </span>
            Open to AI/ML & quant engineering roles
          </span>
        </motion.div>

        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative h-28 w-28 rounded-full"
          >
            <motion.div
              className="absolute inset-0 rounded-full p-[2px]"
              style={{ background: "conic-gradient(from 0deg, #2dd4f0, #a78bfa, #3ddc84, #2dd4f0)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[2px] overflow-hidden rounded-full border-4 border-void bg-void">
              <img src="/images/logo1.jpeg" alt="Shivang Raval" className="h-full w-full object-cover" />
            </div>
          </motion.div>
        </div>

        <h1 className="mb-4 flex flex-wrap justify-center text-5xl font-bold tracking-tight sm:text-7xl">
          {headline.map((char, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.03, ease: EASE }}
              className="text-gradient"
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </h1>

        <motion.div
          variants={staggerContainer(0.15, 0.9)}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.p variants={fadeUp} className="font-mono text-xl text-ink-secondary sm:text-2xl">
            <RotatingRole />
          </motion.p>

          <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-lg leading-relaxed text-ink-secondary">
            Building production ML infrastructure and LLM systems — from distributed training
            platforms to microsecond-precision quantitative trading engines.
          </motion.p>

          <motion.p variants={fadeUp} className="font-mono text-sm text-ink-tertiary">
            Python · PyTorch · LangChain · Kubernetes · C++ · OCaml
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 pt-4">
            <MagneticButton
              href="#projects"
              className="group relative overflow-hidden rounded-full bg-signal-cyan px-8 py-3 font-medium text-void shadow-[0_0_30px_-8px_rgba(45,212,240,0.6)] transition-shadow hover:shadow-[0_0_40px_-6px_rgba(45,212,240,0.8)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="relative">View 20 Projects</span>
            </MagneticButton>
            <MagneticButton
              href="/Shivang_Raval_Resume.pdf"
              download
              className="rounded-full border border-line-strong px-8 py-3 font-medium text-ink-primary transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
            >
              Download Resume
            </MagneticButton>
          </motion.div>

          <motion.div variants={fadeUp} className="flex justify-center gap-6 pt-2">
            {[
              { icon: Mail, href: "mailto:shivangraval50@gmail.com" },
              { icon: Linkedin, href: "https://linkedin.com/in/shivang-raval" },
              { icon: Github, href: "https://github.com/shivangraval50" },
            ].map(({ icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-tertiary transition-colors hover:text-signal-cyan"
              >
                <Icon size={22} />
              </a>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="text-ink-tertiary" size={28} />
      </motion.div>
    </section>
  );
}
