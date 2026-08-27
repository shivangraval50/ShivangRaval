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
    <motion.li
      variants={fadeUp}
      className="rounded-card bg-void-card p-5 shadow-e1 ring-1 ring-inset ring-line-subtle"
    >
      {/* Title and date sit on one baseline row; the date is the only monospace
          element left in this section, because it is tabular data. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h4 className="text-[1rem] font-semibold leading-snug tracking-title text-ink-primary">{item.title}</h4>
        {item.period && (
          <span className="whitespace-nowrap font-mono text-[0.75rem] tabular-nums text-ink-tertiary">
            {item.period}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[0.9375rem] leading-snug text-ink-secondary">{item.meta}</p>
    </motion.li>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[1.25rem] font-semibold tracking-title text-ink-primary">{children}</h3>
  );
}

export default function Credentials() {
  return (
    <section id="credentials" className="scroll-mt-20 border-t border-line-subtle px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12"
        >
          <p className="eyebrow mb-3">
            <span className="text-ink-tertiary">$</span> cat credentials.yaml
          </p>
          <h2 className="text-[2rem] font-semibold tracking-title text-ink-primary sm:text-[2.5rem]">
            Education &amp; Credentials
          </h2>
        </motion.div>

        {/* Education */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14"
        >
          <motion.div variants={fadeUp}>
            <GroupHeading>
              <span className="inline-flex items-center gap-2.5">
                <GraduationCap className="text-ink-tertiary" size={19} strokeWidth={1.75} aria-hidden="true" />
                Education
              </span>
            </GroupHeading>
          </motion.div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {EDUCATION.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </ul>
        </motion.div>

        {/* Certifications */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14"
        >
          <motion.div variants={fadeUp}>
            <GroupHeading>
              <span className="inline-flex items-center gap-2.5">
                <Award className="text-ink-tertiary" size={19} strokeWidth={1.75} aria-hidden="true" />
                Certifications
              </span>
            </GroupHeading>
          </motion.div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {CERTIFICATIONS.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </ul>
        </motion.div>

        {/* Job Simulations */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14"
        >
          <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="inline-flex items-center gap-2.5 text-[1.25rem] font-semibold tracking-title text-ink-primary">
              <BadgeCheck className="text-ink-tertiary" size={19} strokeWidth={1.75} aria-hidden="true" />
              Job Simulations
            </h3>
            {/* An honest caveat, so it keeps a visible (if quiet) callout tint.
                HIG "Feedback": match the delivery to the significance. */}
            <span className="inline-flex items-center rounded-full bg-signal-amber/[0.10] px-2.5 py-1 text-[0.75rem] font-medium text-signal-amber ring-1 ring-inset ring-signal-amber/20">
              Practical exercise, not a formal certification
            </span>
          </motion.div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {JOB_SIMULATIONS.map((item) => (
              <CredentialCard key={item.title} item={item} />
            ))}
          </ul>
        </motion.div>

        {/* Publications & Organizations */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.div variants={fadeUp}>
            <GroupHeading>Publications &amp; Organizations</GroupHeading>
          </motion.div>
          <ul className="space-y-3">
            {PUBLICATIONS.map((pub) => (
              <motion.li
                key={pub.label}
                variants={fadeUp}
                className="flex items-start gap-3.5 rounded-card bg-void-card p-5 shadow-e1 ring-1 ring-inset ring-line-subtle"
              >
                <pub.icon className="mt-0.5 shrink-0 text-ink-tertiary" size={18} strokeWidth={1.75} aria-hidden="true" />
                <p className="max-w-[44rem] text-[0.9375rem] leading-[1.55] text-ink-secondary">
                  <span className="mr-1.5 text-[0.75rem] font-semibold uppercase tracking-label text-ink-tertiary">
                    {pub.label}:
                  </span>
                  {pub.text}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
