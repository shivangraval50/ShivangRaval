"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink, Star } from "lucide-react";
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
    /* Content layer: opaque surface, hairline, soft shadow that deepens on
       hover. HIG "Liquid Glass" explicitly says not to bring the translucent
       material into the content layer, so these cards are solid. */
    <motion.div
      layout
      className="group flex h-full flex-col rounded-card bg-void-card p-5 shadow-e1 ring-1 ring-inset ring-line-subtle transition-shadow duration-200 hover:shadow-e2"
    >
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-label ring-1 ring-inset ${cat.accentSoft} ${cat.accent}`}
        >
          <Icon size={11} strokeWidth={2} aria-hidden="true" /> {cat.label}
        </span>
        {project.featured && (
          <Star
            size={14}
            strokeWidth={2}
            className="shrink-0 fill-signal-amber text-signal-amber"
            aria-label="Featured project"
          />
        )}
      </div>

      <h3 className="mb-2 text-[1.0625rem] font-semibold leading-snug tracking-title text-ink-primary">
        {project.title}
      </h3>
      <p className="mb-4 flex-1 text-[0.9375rem] leading-[1.5] text-ink-secondary">{project.pitch}</p>

      {project.metrics.length > 0 && (
        <dl className="mb-4 space-y-1.5">
          {project.metrics.slice(0, 2).map((m) => (
            <div key={m.label} className="flex items-baseline gap-2 text-[0.8125rem]">
              <dd className="font-mono font-medium tabular-nums text-ink-primary">{m.value}</dd>
              <dt className="min-w-0 truncate text-ink-tertiary">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}

      <ul className="mb-4 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 4).map((t) => (
          <li
            key={t}
            className="rounded-full bg-void-elevated px-2 py-0.5 text-[0.6875rem] text-ink-secondary"
          >
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-1 border-t border-line-subtle pt-3">
        <button
          type="button"
          onClick={onOpenDemo}
          className="inline-flex min-h-11 items-center rounded-full px-2.5 text-[0.9375rem] font-medium text-brand-primary transition-colors duration-200 hover:bg-brand-primary/[0.08]"
        >
          Try it live
        </button>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-[0.9375rem] text-ink-secondary transition-colors duration-200 hover:text-ink-primary"
        >
          <Github size={15} strokeWidth={1.75} aria-hidden="true" /> Code
        </a>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-[0.9375rem] text-ink-secondary transition-colors duration-200 hover:text-ink-primary"
          >
            <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" /> Live
          </a>
        )}
      </div>
    </motion.div>
  );
}
