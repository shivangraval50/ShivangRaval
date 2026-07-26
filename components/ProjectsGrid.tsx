"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import type { Project } from "@/types/project";
import { CATEGORIES } from "@/data/categories";
import ProjectCard from "./ProjectCard";
import { EASE } from "@/lib/motion";

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
      <div className="mb-10 flex flex-wrap justify-center gap-2">
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

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <ProjectCard project={project} onOpenDemo={() => onOpenDemo(project)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-16 text-center font-mono text-sm text-ink-tertiary">No projects in this category yet.</p>
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
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
        active
          ? "border-brand-primary/50 bg-brand-primary/10 text-brand-primary"
          : "border-line-subtle text-ink-secondary hover:border-line-strong hover:text-ink-primary"
      }`}
    >
      <Icon size={12} /> {label} <span className="text-ink-tertiary">({count})</span>
    </button>
  );
}
