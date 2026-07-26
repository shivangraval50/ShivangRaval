"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink, Sparkles } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";

interface Props {
  project: Project;
  onOpenDemo: () => void;
}

export default function ProjectCard({ project, onOpenDemo }: Props) {
  const cat = getCategory(project.category);

  const Icon = cat.icon;

  return (
    <motion.div
      layoutId={`card-${project.id}`}
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-line-subtle bg-void-card shadow-lg shadow-black/20 transition-colors hover:border-line-strong hover:shadow-2xl`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${cat.gradient}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${cat.accentSoft} ${cat.accent}`}
          >
            <Icon size={11} /> {cat.label}
          </span>
          {project.featured && <Sparkles size={14} className="shrink-0 text-signal-amber" />}
        </div>

        <h3 className="mb-2 text-lg font-semibold text-ink-primary transition-colors group-hover:text-signal-cyan">
          {project.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-secondary">{project.pitch}</p>

        {project.metrics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {project.metrics.slice(0, 2).map((m) => (
              <span
                key={m.label}
                className="rounded-md bg-void-elevated px-2 py-1 font-mono text-xs text-ink-secondary"
              >
                <span className="text-signal-cyan">{m.value}</span> {m.label}
              </span>
            ))}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full bg-void-elevated px-2 py-0.5 text-[11px] text-ink-tertiary">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-line-subtle pt-4">
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 font-mono text-sm font-medium text-signal-cyan transition-colors hover:text-white"
          >
            <Sparkles size={14} /> Try it live
          </button>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink-primary"
          >
            <Github size={15} /> Code
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink-primary"
            >
              <ExternalLink size={15} /> Live
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
