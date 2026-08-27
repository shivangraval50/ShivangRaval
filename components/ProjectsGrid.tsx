"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import type { Project } from "@/types/project";
import { CATEGORIES } from "@/data/categories";
import ProjectCard from "./ProjectCard";
import { DUR, EASE } from "@/lib/motion";

interface Props {
  projects: Project[];
  onOpenDemo: (p: Project) => void;
}

export default function ProjectsGrid({ projects, onOpenDemo }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: projects.length };
    for (const cat of CATEGORIES) map[cat.id] = projects.filter((p) => p.category === cat.id).length;
    return map;
  }, [projects]);

  return (
    <div>
      {/* Segmented filter. Roles make the selection state audible as well as
          visible — HIG "Accessibility": don't convey state with colour alone. */}
      <div
        role="tablist"
        aria-label="Filter projects by domain"
        className="mb-10 flex flex-wrap gap-2"
      >
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={counts.all}
          icon={LayoutGrid}
        />
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat.id}
            active={filter === cat.id}
            onClick={() => setFilter(cat.id)}
            label={cat.label}
            count={counts[cat.id]}
            icon={cat.icon}
          />
        ))}
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: DUR.short, ease: EASE }}
            >
              <ProjectCard project={project} onOpenDemo={() => onOpenDemo(project)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-[0.9375rem] text-ink-tertiary">No projects in this category yet.</p>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: import("lucide-react").LucideIcon;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-200 ${
        active
          ? "bg-ink-primary text-void ring-1 ring-inset ring-ink-primary"
          : "bg-void-card text-ink-secondary ring-1 ring-inset ring-line-subtle hover:text-ink-primary hover:ring-line-strong"
      }`}
    >
      <Icon size={13} strokeWidth={1.75} aria-hidden="true" /> {label}{" "}
      <span className={active ? "text-void/70" : "text-ink-tertiary"}>({count})</span>
    </button>
  );
}
