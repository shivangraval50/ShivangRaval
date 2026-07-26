"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown, Sparkles } from "lucide-react";
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
          className="col-start-1 row-start-1 whitespace-nowrap text-brand-primary"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Two soft radial glows that drift a few pixels toward the cursor — an atmospheric
 *  backdrop (in the vein of a hand-built editorial hero) rendered in the brand hues. */
function ParallaxGlow() {
  const prefersReduced = useReducedMotion();
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sx = useSpring(mvX, { stiffness: 40, damping: 20, mass: 0.6 });
  const sy = useSpring(mvY, { stiffness: 40, damping: 20, mass: 0.6 });
  const sxInv = useTransform(sx, (v) => -v);
  const syInv = useTransform(sy, (v) => -v);

  useEffect(() => {
    if (prefersReduced) return;
    function handleMove(e: MouseEvent) {
      mvX.set((e.clientX / window.innerWidth - 0.5) * 2 * 26);
      mvY.set((e.clientY / window.innerHeight - 0.5) * 2 * 26);
    }
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [prefersReduced, mvX, mvY]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={prefersReduced ? undefined : { x: sx, y: sy }}
        className="absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-brand-primary/[0.18] blur-[110px] dark:bg-brand-primary/[0.16]"
      />
      <motion.div
        style={prefersReduced ? undefined : { x: sxInv, y: syInv }}
        className="absolute -top-24 left-[-12%] h-[28rem] w-[28rem] rounded-full bg-brand-accent/[0.14] blur-[110px] dark:bg-brand-accent/[0.14]"
      />
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = "Shivang Raval".split("");

  return (
    <section
      id="main-content"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8"
    >
      <ParallaxGlow />

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto grid w-full max-w-6xl items-center gap-y-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-12"
      >
        {/* Text column */}
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-5 font-mono text-sm text-signal-green"
          >
            <span className="text-ink-tertiary">$</span> whoami
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="mx-auto mb-6 max-w-xl text-xl font-medium leading-snug text-ink-secondary sm:text-2xl lg:mx-0"
          >
            Twenty real systems you can{" "}
            <span className="text-brand-primary">run yourself</span> — not slides, not screenshots, not
            scripted demos.
          </motion.p>

          <h1 className="mb-4 flex flex-wrap justify-center text-5xl font-bold tracking-tight sm:text-6xl lg:justify-start lg:text-7xl">
            {headline.map((char, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.03, ease: EASE }}
                className="text-gradient"
              >
                {char === " " ? " " : char}
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

            <motion.div variants={fadeUp} className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal-green/30 bg-signal-green/10 px-3 py-1 font-mono text-xs text-signal-green">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-green" />
                </span>
                Open to AI/ML & quant engineering roles
              </span>
            </motion.div>

            <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-lg leading-relaxed text-ink-secondary lg:mx-0">
              Building production ML infrastructure and LLM systems — from distributed training
              platforms to microsecond-precision quantitative trading engines.
            </motion.p>

            <motion.p variants={fadeUp} className="font-mono text-sm text-ink-tertiary">
              Python · PyTorch · LangChain · Kubernetes · C++ · OCaml
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 pt-4 lg:justify-start">
              <MagneticButton
                href="#projects"
                className="group relative overflow-hidden rounded-full bg-brand-primary px-8 py-3 font-medium text-white shadow-[0_0_30px_-8px_hsl(var(--brand-primary)/0.6)] transition-shadow hover:shadow-[0_0_40px_-6px_hsl(var(--brand-primary)/0.8)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <span className="relative">View 20 Projects</span>
              </MagneticButton>
              <MagneticButton
                href="/Shivang_Raval_Resume.pdf"
                download
                className="rounded-full border border-line-strong px-8 py-3 font-medium text-ink-primary transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
              >
                Download Resume
              </MagneticButton>
            </motion.div>

            <motion.div variants={fadeUp} className="flex justify-center gap-6 pt-2 lg:justify-start">
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
                  className="text-ink-tertiary transition-colors hover:text-brand-primary"
                >
                  <Icon size={22} />
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Avatar column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative h-44 w-44 rounded-full sm:h-56 sm:w-56 lg:h-64 lg:w-64">
            <motion.div
              className="absolute inset-0 rounded-full p-[3px]"
              style={{
                background:
                  "conic-gradient(from 0deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)), hsl(var(--signal-green)), hsl(var(--brand-primary)))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[3px] overflow-hidden rounded-full border-4 border-void bg-void">
              <img src="/images/logo1.jpeg" alt="Shivang Raval" className="h-full w-full object-cover" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
              className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-void bg-brand-accent text-white shadow-lg sm:h-12 sm:w-12"
            >
              <Sparkles size={18} />
            </motion.div>
          </div>
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
