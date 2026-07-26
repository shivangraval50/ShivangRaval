"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, ExternalLink, Sparkles } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";
import { PLAYGROUNDS } from "./playgrounds/registry";
import { EASE } from "@/lib/motion";

function FeaturedCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const cat = getCategory(project.category);
  const Icon = cat.icon;
  const Playground = PLAYGROUNDS[project.id];

  return (
    <div
      ref={ref}
      className="group rounded-3xl border border-line-subtle bg-void-card/60 p-6 transition-colors hover:border-line-strong sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
        className="mb-6"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-amber/30 bg-signal-amber/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-signal-amber">
            <Sparkles size={12} /> Featured
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide ${cat.accentSoft} ${cat.accent}`}
          >
            <Icon size={12} /> {cat.label}
          </span>
        </div>
        <h3 className="mb-3 text-2xl font-bold text-ink-primary sm:text-3xl">{project.title}</h3>
        <p className="mb-5 max-w-3xl leading-relaxed text-ink-secondary">{project.description}</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span key={t} className="rounded-full bg-void-elevated px-3 py-1 text-xs text-ink-tertiary">
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-primary transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
          >
            <Github size={16} /> Code
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <ExternalLink size={16} /> Live
            </a>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
      >
        {inView && Playground && <Playground />}
      </motion.div>
    </div>
  );
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-10">
      {projects.map((p) => (
        <FeaturedCard key={p.id} project={p} />
      ))}
    </div>
  );
}
