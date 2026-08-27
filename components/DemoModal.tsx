"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink } from "lucide-react";
import type { Project } from "@/types/project";
import { getCategory } from "@/data/categories";
import { PLAYGROUNDS } from "./playgrounds/registry";
import { DUR, EASE } from "@/lib/motion";

/**
 * Project playground presented modally.
 *
 * HIG "Modality": a modal must name its task, offer an obvious way out, and
 * keep the task simple. So: a labelled dialog with the project title as its
 * accessible name, a close button in the top-trailing corner, Escape, and a
 * click on the dimmed backdrop. Focus moves into the sheet on open and returns
 * to the opener on close, and Tab is kept inside while it's up — HIG
 * "Accessibility": the whole interface must be usable from the keyboard alone.
 *
 * The material here is the "regular" variant of the system's translucency
 * (blur + dim behind a legible opaque sheet), which is what HIG "Liquid Glass"
 * prescribes for a surface carrying significant text.
 */
export default function DemoModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;

    openerRef.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      sheetRef.current
        ?.querySelector<HTMLElement>('button[data-close="true"]')
        ?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      openerRef.current?.focus?.();
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
            transition={{ duration: DUR.short, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md dark:bg-black/60"
          />
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={project.title}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: DUR.short, ease: EASE }}
              className="pointer-events-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-sheet bg-void-card shadow-sheet ring-1 ring-inset ring-line-subtle"
            >
              <div className="p-5 sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span
                      className={`mb-2.5 inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-label ring-1 ring-inset ${getCategory(project.category).accentSoft} ${getCategory(project.category).accent}`}
                    >
                      {getCategory(project.category).label}
                    </span>
                    <h3 className="text-[1.5rem] font-semibold tracking-title text-ink-primary sm:text-[1.875rem]">
                      {project.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    data-close="true"
                    onClick={onClose}
                    aria-label="Close demo"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-void-elevated text-ink-secondary transition-colors duration-200 hover:text-ink-primary"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>

                <p className="mb-7 max-w-[46rem] text-[1rem] leading-[1.55] text-ink-secondary">
                  {project.description}
                </p>

                {(() => {
                  const Playground = PLAYGROUNDS[project.id];
                  return Playground ? <Playground /> : null;
                })()}

                {project.accuracyNote && (
                  <p className="mt-5 max-w-[46rem] rounded-control bg-void-elevated p-3.5 text-[0.8125rem] leading-[1.6] text-ink-secondary">
                    ⚠ {project.accuracyNote}
                  </p>
                )}

                <ul className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li key={t} className="rounded-full bg-void-elevated px-2.5 py-1 text-[0.75rem] text-ink-secondary">
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-3 border-t border-line-subtle pt-6">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium text-ink-primary ring-1 ring-inset ring-line-strong transition-colors duration-200 hover:bg-ink-primary/[0.05]"
                  >
                    <Github size={16} strokeWidth={1.75} aria-hidden="true" /> View Code
                  </a>
                  {project.homepage && (
                    <a
                      href={project.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-fill px-5 text-[0.9375rem] font-medium text-brand-onfill transition-opacity duration-200 hover:opacity-90"
                    >
                      <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" /> Live Site
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
