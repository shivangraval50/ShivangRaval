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
    accentSoft: "bg-signal-violet/10 border-signal-violet/30",
    borderAccent: "border-l-signal-violet",
    items: ["Distributed Training", "Model Serving", "MLOps", "RLHF", "Production ML", "FAISS"],
  },
  {
    category: "NLP & Applied ML",
    icon: MessageSquare,
    accent: "text-signal-amber",
    accentSoft: "bg-signal-amber/10 border-signal-amber/30",
    borderAccent: "border-l-signal-amber",
    items: ["RAG Systems", "LLM Inference", "Semantic Search", "Entity Resolution", "Content Classification"],
  },
  {
    category: "Quantitative Trading",
    icon: LineChart,
    accent: "text-signal-cyan",
    accentSoft: "bg-signal-cyan/10 border-signal-cyan/30",
    borderAccent: "border-l-signal-cyan",
    items: ["Statistical Arbitrage", "Market Microstructure", "Execution Algorithms", "Kalman Filters", "Backtesting"],
  },
  {
    category: "Systems & Languages",
    icon: Terminal,
    accent: "text-signal-emerald",
    accentSoft: "bg-signal-emerald/10 border-signal-emerald/30",
    borderAccent: "border-l-signal-emerald",
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
    accentSoft: "bg-signal-rose/10 border-signal-rose/30",
    borderAccent: "border-l-signal-rose",
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
    accentSoft: "bg-signal-blue/10 border-signal-blue/30",
    borderAccent: "border-l-signal-blue",
    items: ["Claude Code", "Cursor", "GitHub Copilot", "Model Context Protocol (MCP)", "LangGraph", "LangChain"],
  },
];

const CORE_TECH = ["Python", "C++", "Java", "TypeScript", "OCaml", "SQL", "Bash"];

interface SkillBadgeProps {
  label: string;
  accent: string;
  accentSoft: string;
}

function SkillBadge({ label, accent, accentSoft }: SkillBadgeProps) {
  const controls = useAnimationControls();

  const replay = () => {
    controls.start({
      scale: [1, 1.28, 0.92, 1.06, 1],
      transition: { duration: 0.5, ease: EASE },
    });
  };

  return (
    <motion.button
      type="button"
      animate={controls}
      onClick={replay}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      title="Click to replay this skill's animation"
      className={`rounded-full border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${accentSoft} ${accent}`}
    >
      {label}
    </motion.button>
  );
}

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
          <p className="mx-auto mt-4 max-w-2xl text-ink-secondary">
            Six domains I build production systems in — click any skill badge to replay its animation.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SKILL_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.category}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={`rounded-2xl border border-l-4 border-line-subtle bg-void-card p-6 ${group.borderAccent}`}
              >
                <h3 className={`mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-wide ${group.accent}`}>
                  <Icon size={16} />
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <SkillBadge key={item} label={item} accent={group.accent} accentSoft={group.accentSoft} />
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
          className="mt-12 text-center"
        >
          <h3 className="mb-6 text-xl font-semibold text-ink-primary">Core Technologies</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CORE_TECH.map((tech) => (
              <motion.span
                key={tech}
                whileHover={{ y: -3 }}
                className="rounded-full border border-line-strong bg-void-elevated px-5 py-2 font-mono text-sm text-ink-primary shadow-sm transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
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
