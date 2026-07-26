"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";
import DemoPanel from "./demos/DemoPanel";
import { EASE } from "@/lib/motion";

export default function DemoModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-void/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              layoutId={`card-${project.id}`}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line-strong bg-void-card shadow-2xl"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${getCategory(project.category).gradient}`} />
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${getCategory(project.category).accentSoft} ${getCategory(project.category).accent}`}
                    >
                      {getCategory(project.category).label}
                    </span>
                    <h3 className="text-2xl font-bold text-ink-primary">{project.title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close demo"
                    className="shrink-0 rounded-full border border-line-subtle p-2 text-ink-secondary transition-colors hover:border-line-strong hover:text-ink-primary"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="mb-6 leading-relaxed text-ink-secondary">{project.description}</p>

                <DemoPanel demo={project.demo} />

                {project.accuracyNote && (
                  <p className="mt-4 font-mono text-xs leading-relaxed text-ink-tertiary">
                    ⚠ {project.accuracyNote}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="rounded-full bg-void-elevated px-2.5 py-1 text-xs text-ink-tertiary">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex gap-4 border-t border-line-subtle pt-6">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-primary transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
                  >
                    <Github size={16} /> View Code
                  </a>
                  {project.homepage && (
                    <a
                      href={project.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full bg-signal-cyan px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90"
                    >
                      <ExternalLink size={16} /> Live Site
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
