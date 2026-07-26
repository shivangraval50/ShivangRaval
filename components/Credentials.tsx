"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, BadgeCheck, FileText, Users, type LucideIcon } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

interface CredentialEntry {
  title: string;
  meta: string;
  period?: string;
}

const EDUCATION: CredentialEntry[] = [
  {
    title: "M.S. Computer Science",
    meta: "Northeastern University, Khoury College of Computer Sciences · Boston, MA",
    period: "Expected June 2027",
  },
  {
    title: "B.Tech. Computer Science",
    meta: "Pandit Deendayal Energy University · Gandhinagar, India",
    period: "2021–2025",
  },
];

const CERTIFICATIONS: CredentialEntry[] = [
  {
    title: "Google Cloud Certified: Machine Learning Engineer",
    meta: "Google Cloud",
  },
  {
    title: "Machine Learning Rock Star – The End-to-End Practice (Specialization)",
    meta: "SAS",
    period: "Jun 2024",
  },
  {
    title: "Machine Learning with Python",
    meta: "freeCodeCamp",
    period: "Sep 2024",
  },
  {
    title: "Data Analysis with Python",
    meta: "freeCodeCamp",
    period: "Jan 2024",
  },
  {
    title:
      "Generative AI on Google Cloud (4-course series: Intro to Generative AI, Generative AI Fundamentals, Intro to GenAI Studio, Encoder-Decoder Architecture)",
    meta: "Udacity",
    period: "Nov 2023",
  },
];

const JOB_SIMULATIONS: CredentialEntry[] = [
  {
    title: "BCG GenAI Job Simulation",
    meta: "Forage",
    period: "Sep 2024",
  },
  {
    title: "J.P. Morgan Software Engineering Job Simulation",
    meta: "Forage",
    period: "Mar 2024",
  },
];

interface PublicationEntry {
  icon: LucideIcon;
  label: string;
  text: string;
}

const PUBLICATIONS: PublicationEntry[] = [
  {
    icon: FileText,
    label: "Publication",
    text: '"ML Deployment Platforms in Business: Scalable Infrastructure, Operational Challenges, and Deployment Strategies" — IJISRT, 2024',
  },
  {
    icon: Users,
    label: "Organization",
    text: "GDG Cloud Boston — Member, BuildWithAI 2026 Participant",
  },
];

function CredentialCard({ item }: { item: CredentialEntry }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-line-subtle bg-void-card p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h4 className="font-semibold text-ink-primary">{item.title}</h4>
        {item.period && (
          <span className="whitespace-nowrap font-mono text-xs text-ink-tertiary">{item.period}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-secondary">{item.meta}</p>
    </motion.div>
  );
}

export default function Credentials() {
  return (
    <section id="credentials" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-sm text-signal-green">
            <span className="text-ink-tertiary">$</span> cat credentials.yaml
          </p>
          <h2 className="text-4xl font-bold text-ink-primary">Education & Credentials</h2>
        </motion.div>

        {/* Education */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12"
        >
          <motion.h3 variants={fadeUp} className="mb-4 flex items-center gap-2 text-xl font-semibold text-ink-primary">
            <GraduationCap className="text-brand-primary" size={20} /> Education
          </motion.h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {EDUCATION.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12"
        >
          <motion.h3 variants={fadeUp} className="mb-4 flex items-center gap-2 text-xl font-semibold text-ink-primary">
            <Award className="text-brand-primary" size={20} /> Certifications
          </motion.h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {CERTIFICATIONS.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </div>
        </motion.div>

        {/* Job Simulations */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12"
        >
          <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-ink-primary">
              <BadgeCheck className="text-signal-amber" size={20} /> Job Simulations
            </h3>
            <span className="inline-flex items-center rounded-full border border-signal-amber/30 bg-signal-amber/10 px-3 py-1 font-mono text-xs text-signal-amber">
              Practical exercise, not a formal certification
            </span>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {JOB_SIMULATIONS.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </div>
        </motion.div>

        {/* Publications & Organizations */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.h3 variants={fadeUp} className="mb-4 text-xl font-semibold text-ink-primary">
            Publications & Organizations
          </motion.h3>
          <div className="space-y-3">
            {PUBLICATIONS.map((pub) => (
              <motion.div
                key={pub.label}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-2xl border border-line-subtle bg-void-card p-5 transition-colors hover:border-line-strong"
              >
                <pub.icon className="mt-0.5 shrink-0 text-brand-primary" size={18} />
                <p className="text-sm leading-relaxed text-ink-secondary">
                  <span className="mr-1 font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                    {pub.label}:
                  </span>
                  {pub.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
