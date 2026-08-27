"use client";

import { useId } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";

/**
 * Shared chrome for the twenty project playgrounds.
 *
 * This is the highest-leverage file for the playgrounds: restyling here restyles
 * all twenty without touching their logic. Controls keep a visible focus-visible
 * ring (the previous `focus:outline-none` on the inputs silently removed the
 * only keyboard affordance they had), and use the system's quiet fill-and-hairline
 * treatment instead of neon borders.
 *
 * HIG "Accessibility" 44 pt touch minimum: met by PgToggle (its whole row is the
 * button, ~47 pt) and PgSlider (the input's own box is the hit area, sized to
 * ~44 pt around the thin visible track). PgButton (~38 pt) and ScenarioBar's
 * pills (~34 pt) are compact secondary/tertiary actions and land under it —
 * flagging rather than papering over it, since bumping their height ripples
 * into every playground's layout and is out of scope for a chrome-only pass.
 */

export function PgShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-4 lg:grid-cols-2 ${className ?? ""}`}>{children}</div>;
}

export function PgPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 rounded-control bg-void-surface p-4 ring-1 ring-inset ring-line-subtle ${className ?? ""}`}>
      {title && (
        <div className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function PgButton({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const variants = {
    primary: "bg-brand-fill text-brand-onfill hover:opacity-90",
    secondary:
      "bg-void-card text-ink-primary ring-1 ring-inset ring-line-strong hover:bg-ink-primary/[0.05]",
    ghost: "text-ink-secondary hover:bg-ink-primary/[0.05] hover:text-ink-primary",
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-[0.8125rem] font-medium transition-[opacity,background-color,color] duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

const fieldBase =
  "w-full rounded-control bg-void-card px-3 py-2.5 font-mono text-[0.8125rem] text-ink-primary ring-1 ring-inset ring-line-subtle placeholder:text-ink-tertiary transition-shadow duration-200 hover:ring-line-strong focus:outline-none focus:ring-2 focus:ring-brand-primary";

export function PgInput(props: InputHTMLAttributes<HTMLInputElement>) {
  // A stable id/name keeps the browser's autofill heuristics quiet and gives
  // assistive tech something to anchor to when there's no wrapping <label>.
  const auto = useId();
  return <input id={props.id ?? auto} name={props.name ?? auto} {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function PgTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  return (
    <textarea
      id={props.id ?? auto}
      name={props.name ?? auto}
      {...props}
      className={`${fieldBase} leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function PgSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const auto = useId();
  return (
    <select
      id={auto}
      name={auto}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldBase} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${className ?? ""}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%238a8a8f' stroke-width='1.75' stroke-linecap='round'%3E%3Cpath d='M4 6.5 8 10.5 12 6.5'/%3E%3C/svg%3E\")",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function PgSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const auto = useId();
  return (
    <label className="block" htmlFor={auto}>
      <div className="mb-2 flex justify-between gap-3 text-[0.8125rem] text-ink-secondary">
        <span className="min-w-0">{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-ink-primary">
          {format ? format(value) : value}
        </span>
      </div>
      {/* 44 pt vertical hit area around a 4 pt track — HIG "Accessibility". The
          input's own box is the hit area (native range inputs register
          pointer events anywhere in their box); the visible track and thumb
          keep their thin sizes below via the pseudo-element utilities. */}
      <input
        id={auto}
        name={auto}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-[2.5882rem] w-full cursor-pointer appearance-none bg-transparent accent-brand-primary [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-line-strong [&::-webkit-slider-thumb]:-mt-[0.3125rem] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-fill [&::-webkit-slider-thumb]:shadow-e1"
      />
    </label>
  );
}

export function PgToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-control bg-void-card px-3 py-2 text-left ring-1 ring-inset ring-line-subtle transition-colors duration-200 hover:ring-line-strong"
      aria-pressed={checked}
    >
      <span className="min-w-0 text-[0.8125rem] leading-snug text-ink-secondary">{label}</span>
      {/* The system switch: 51×31 pt at scale, thumb inset by 2. */}
      <span
        aria-hidden="true"
        className={`relative h-[1.375rem] w-[2.375rem] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-brand-fill" : "bg-line-strong"
        }`}
      >
        <motion.span
          className="absolute top-[0.1875rem] h-4 w-4 rounded-full bg-white shadow-e1"
          animate={{ x: checked ? "1.0625rem" : "0.1875rem" }}
          transition={{ type: "spring", stiffness: 620, damping: 38, mass: 0.4 }}
        />
      </span>
    </button>
  );
}

export function ScenarioBar({
  scenarios,
}: {
  scenarios: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">Try:</span>
      {scenarios.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={s.onClick}
          className="inline-flex min-h-8 items-center rounded-full bg-void-card px-3 text-[0.75rem] font-medium text-ink-secondary ring-1 ring-inset ring-line-subtle transition-colors duration-200 hover:text-ink-primary hover:ring-line-strong"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function StatValue({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: string;
  tone?: "cyan" | "green" | "amber" | "red";
}) {
  const tones = {
    cyan: "text-ink-primary",
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red",
  };
  return (
    /* `min-w-0` plus a size that fits the narrowest column these ever land in
       (a four-up row inside the modal sheet, ~86 px per column). The old
       `text-2xl` no-wrap value collided with its neighbours there. */
    <div className="min-w-0">
      <div className={`break-words font-mono text-[1rem] font-semibold leading-tight tabular-nums ${tones[tone]}`}>
        {value}
      </div>
      <div className="mt-1 text-[0.75rem] leading-snug text-ink-tertiary">{label}</div>
    </div>
  );
}

export function PgNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.75rem] leading-[1.6] text-ink-tertiary">
      <span aria-hidden="true">⚠ </span>
      {children}
    </p>
  );
}
