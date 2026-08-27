"use client";

import { motion, useAnimationControls } from "framer-motion";
import {
  Cpu,
  MessageSquare,
  LineChart,
  Terminal,
  Cloud,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce, EASE } from "@/lib/motion";

interface SkillGroup {
  category: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  borderAccent: string;
  items: string[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "AI & ML Infrastructure",
    icon: Cpu,
    accent: "text-signal-violet",
    accentSoft: "bg-signal-violet/[0.10] ring-signal-violet/20",
    borderAccent: "text-signal-violet",
    items: ["Distributed Training", "Model Serving", "MLOps", "RLHF", "Production ML", "FAISS"],
  },
  {
    category: "NLP & Applied ML",
    icon: MessageSquare,
    accent: "text-signal-amber",
    accentSoft: "bg-signal-amber/[0.10] ring-signal-amber/20",
    borderAccent: "text-signal-amber",
    items: ["RAG Systems", "LLM Inference", "Semantic Search", "Entity Resolution", "Content Classification"],
  },
  {
    category: "Quantitative Trading",
    icon: LineChart,
    accent: "text-signal-cyan",
    accentSoft: "bg-signal-cyan/[0.10] ring-signal-cyan/20",
    borderAccent: "text-signal-cyan",
    items: ["Statistical Arbitrage", "Market Microstructure", "Execution Algorithms", "Kalman Filters", "Backtesting"],
  },
  {
    category: "Systems & Languages",
    icon: Terminal,
    accent: "text-signal-emerald",
    accentSoft: "bg-signal-emerald/[0.10] ring-signal-emerald/20",
    borderAccent: "text-signal-emerald",
    items: [
      "C++",
      "OCaml",
      "Java",
      "Low-Latency Systems",
      "Interpreters & Compilers",
      "Concurrency",
      "Type Systems",
      "Property-Based Testing",
    ],
  },
  {
    category: "Cloud & Infrastructure",
    icon: Cloud,
    accent: "text-signal-rose",
    accentSoft: "bg-signal-rose/[0.10] ring-signal-rose/20",
    borderAccent: "text-signal-rose",
    items: [
      "GCP (Vertex AI, ADK, Gemini API)",
      "AWS",
      "SageMaker",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Kafka",
      "Redis",
      "PostgreSQL",
    ],
  },
  {
    category: "AI-Native Development",
    icon: Sparkles,
    accent: "text-signal-blue",
    accentSoft: "bg-signal-blue/[0.10] ring-signal-blue/20",
    borderAccent: "text-signal-blue",
    items: ["Claude Code", "Cursor", "GitHub Copilot", "Model Context Protocol (MCP)", "LangGraph", "LangChain"],
  },
];

const CORE_TECH = ["Python", "C++", "Java", "TypeScript", "OCaml", "SQL", "Bash"];

interface SkillBadgeProps {
  label: string;
}

function SkillBadge({ label }: SkillBadgeProps) {
  const controls = useAnimationControls();

  /* The copy invites you to "replay this skill's animation", so the replay
     stays — but at the amplitude HIG "Motion" asks for (brief, precise) rather
     than the previous 1 → 1.28 → 0.92 → 1.06 bounce. */
  const replay = () => {
    controls.start({
      scale: [1, 1.07, 1],
      transition: { duration: 0.28, ease: EASE },
    });
  };

  return (
    <motion.button
      type="button"
      animate={controls}
      onClick={replay}
      whileTap={{ scale: 0.97 }}
      title="Click to replay this skill's animation"
      /* Neutral fill, deliberately. HIG "Color" asks for colour that carries
         meaning; forty tinted pills across six hues decorated rather than
         informed. The domain hue now lives on one element — the group icon. */
      className="rounded-full bg-void-elevated px-3 py-1.5 text-[0.8125rem] font-medium text-ink-secondary transition-colors duration-200 hover:text-ink-primary"
    >
      {label}
    </motion.button>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 border-t border-line-subtle px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12 max-w-[42rem]"
        >
          <p className="eyebrow mb-3">
            <span className="text-ink-tertiary">$</span> cat skills.json
          </p>
          <h2 className="text-[2rem] font-semibold tracking-title text-ink-primary sm:text-[2.5rem]">
            Skills &amp; Expertise
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-secondary">
            Six domains I build production systems in — click any skill badge to replay its animation.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SKILL_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.category}
                variants={fadeUp}
                className="rounded-card bg-void-card p-5 shadow-e1 ring-1 ring-inset ring-line-subtle transition-shadow duration-200 hover:shadow-e2"
              >
                <h3 className="mb-4 flex items-center gap-2.5 text-[0.9375rem] font-semibold tracking-title text-ink-primary">
                  <Icon size={17} strokeWidth={1.75} className={group.borderAccent} aria-hidden="true" />
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <SkillBadge key={item} label={item} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16"
        >
          <h3 className="mb-5 text-[1.25rem] font-semibold tracking-title text-ink-primary">Core Technologies</h3>
          <div className="flex flex-wrap gap-2.5">
            {CORE_TECH.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-void-card px-4 py-2 font-mono text-[0.8125rem] text-ink-primary shadow-e1 ring-1 ring-inset ring-line-subtle"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
