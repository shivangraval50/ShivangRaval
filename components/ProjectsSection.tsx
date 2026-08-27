"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/types/project";
import FeaturedProjects from "./FeaturedProjects";
import ProjectsGrid from "./ProjectsGrid";
import DemoModal from "./DemoModal";
import { fadeUp, viewportOnce } from "@/lib/motion";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="projects" className="scroll-mt-20 border-t border-line-subtle bg-void-surface px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12 max-w-[42rem]"
        >
          <p className="eyebrow mb-3">
            <span className="text-ink-tertiary">$</span> ls ./projects --count=20
          </p>
          <h2 className="mb-4 text-[2rem] font-semibold tracking-title text-ink-primary sm:text-[2.5rem]">
            Featured Work
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-ink-secondary">
            From quantitative trading systems to distributed ML infrastructure — 20 projects,
            each with a real, working playground you can test yourself, not just a screenshot.
          </p>
        </motion.div>

        <FeaturedProjects projects={featured} />

        <div className="my-20 h-px bg-line-subtle" />

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <ProjectsGrid projects={projects} onOpenDemo={setActive} />
        </motion.div>
      </div>

      <DemoModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
