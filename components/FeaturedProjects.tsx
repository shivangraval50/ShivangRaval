"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, ExternalLink, Star } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";
import { PLAYGROUNDS } from "./playgrounds/registry";
import { DUR, EASE } from "@/lib/motion";

function FeaturedCard({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const cat = getCategory(project.category);
  const Icon = cat.icon;
  const Playground = PLAYGROUNDS[project.id];

  return (
    <article
      ref={ref}
      className="rounded-sheet bg-void-card p-6 shadow-e1 ring-1 ring-inset ring-line-subtle sm:p-9"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: DUR.medium, ease: EASE }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-amber/[0.10] px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-label text-signal-amber ring-1 ring-inset ring-signal-amber/20">
            <Star size={11} strokeWidth={2} className="fill-current" aria-hidden="true" /> Featured
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-label ring-1 ring-inset ${cat.accentSoft} ${cat.accent}`}
          >
            <Icon size={11} strokeWidth={2} aria-hidden="true" /> {cat.label}
          </span>
        </div>
        <h3 className="mb-3.5 text-[1.625rem] font-semibold tracking-title text-ink-primary sm:text-[2rem]">
          {project.title}
        </h3>
        <p className="mb-6 max-w-[46rem] text-[1.0625rem] leading-[1.55] text-ink-secondary">
          {project.description}
        </p>
        <ul className="mb-7 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li key={t} className="rounded-full bg-void-elevated px-2.5 py-1 text-[0.75rem] text-ink-secondary">
              {t}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium text-ink-primary ring-1 ring-inset ring-line-strong transition-colors duration-200 hover:bg-ink-primary/[0.05]"
          >
            <Github size={16} strokeWidth={1.75} aria-hidden="true" /> Code
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-fill px-5 text-[0.9375rem] font-medium text-brand-onfill transition-opacity duration-200 hover:opacity-90"
            >
              <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" /> Live
            </a>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: DUR.medium, ease: EASE, delay: 0.08 }}
      >
        {inView && Playground && <Playground />}
      </motion.div>
    </article>
  );
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-6">
      {projects.map((p) => (
        <FeaturedCard key={p.id} project={p} />
      ))}
    </div>
  );
}
