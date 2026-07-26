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
    <section id="projects" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-sm text-signal-green">
            <span className="text-ink-tertiary">$</span> ls ./projects --count=20
          </p>
          <h2 className="mb-4 text-4xl font-bold text-ink-primary sm:text-5xl">Featured Work</h2>
          <p className="mx-auto max-w-2xl text-ink-secondary">
            From quantitative trading systems to distributed ML infrastructure — 20 projects,
            each with a real, interactive look under the hood.
          </p>
        </motion.div>

        <FeaturedProjects projects={featured} />

        <div className="my-20 h-px bg-line-subtle" />

        <ProjectsGrid projects={projects} onOpenDemo={setActive} />
      </div>

      <DemoModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
