"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";
import DemoPanel from "./demos/DemoPanel";
import { EASE } from "@/lib/motion";

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const cat = getCategory(project.category);
  const reversed = index % 2 === 1;

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
        className={reversed ? "lg:order-2" : ""}
      >
        <span
          className={`mb-3 inline-block rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide ${cat.accentSoft} ${cat.accent}`}
        >
          {cat.label}
        </span>
        <h3 className="mb-3 text-3xl font-bold text-ink-primary">{project.title}</h3>
        <p className="mb-5 leading-relaxed text-ink-secondary">{project.description}</p>
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
            className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-primary transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
          >
            <Github size={16} /> Code
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-signal-cyan px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90"
            >
              <ExternalLink size={16} /> Live
            </a>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reversed ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
        className={reversed ? "lg:order-1" : ""}
      >
        {inView && <DemoPanel demo={project.demo} />}
      </motion.div>
    </div>
  );
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-24">
      {projects.map((p, i) => (
        <FeaturedCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
