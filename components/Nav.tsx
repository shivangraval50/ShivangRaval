"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { DUR, EASE } from "@/lib/motion";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "credentials", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    /* The site's one translucent material. HIG "Liquid Glass": use it for the
       top bar — a functional layer floating over content — and nowhere in the
       content layer itself. */
    <header
      className={`fixed top-0 z-50 w-full transition-[background-color,border-color] duration-300 ease-apple ${
        scrolled || mobileOpen
          ? "material-bar border-b border-line-subtle"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <a
          href="#"
          aria-label="Back to top"
          className="-mx-2 rounded-lg px-2 py-1.5 font-mono text-[1.0625rem] font-semibold tracking-tight text-ink-primary"
        >
          SR<span className="text-brand-primary">_</span>
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={active === link.id ? "true" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-200 ${
                active === link.id ? "text-ink-primary" : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {active === link.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-ink-primary/[0.07] dark:bg-ink-primary/[0.10]"
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.6 }}
                />
              )}
              <span className="relative">{link.label}</span>
            </a>
          ))}
          <a
            href="/Shivang_Raval_Resume.pdf"
            download
            className="ml-3 rounded-full bg-brand-fill px-4 py-1.5 text-[0.8125rem] font-medium text-brand-onfill transition-opacity duration-200 hover:opacity-90"
          >
            Resume
          </a>
          <ThemeToggle className="ml-1.5" />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          {/* 44×44 hit area — HIG "Accessibility" mobile control minimum. */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-primary transition-colors hover:bg-ink-primary/[0.06]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} strokeWidth={1.75} /> : <Menu size={21} strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.short, ease: EASE }}
            /* HIG "Liquid Glass": larger surfaces get more opaque so text stays
               legible over complex content. The expanded menu is the largest
               piece of the bar, so it sits on a near-solid fill. */
            className="overflow-hidden border-t border-line-subtle bg-void/95 md:hidden"
          >
            <div className="px-3 py-2">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center rounded-control px-3 text-[1.0625rem] text-ink-primary transition-colors hover:bg-ink-primary/[0.06] active:bg-ink-primary/[0.09]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
