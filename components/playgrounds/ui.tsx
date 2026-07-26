"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";

export function PgShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-5 lg:grid-cols-2 ${className ?? ""}`}>{children}</div>;
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
    <div className={`rounded-xl border border-line-subtle bg-void-elevated p-4 ${className ?? ""}`}>
      {title && (
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-tertiary">{title}</div>
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
    primary: "bg-brand-primary text-white hover:opacity-90",
    secondary:
      "border border-line-strong text-ink-primary hover:border-brand-primary/50 hover:text-brand-primary",
    ghost: "text-ink-secondary hover:text-ink-primary",
  };
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full px-4 py-2 font-mono text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function PgInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-line-subtle bg-void px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand-primary/50 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function PgTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-line-subtle bg-void px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand-primary/50 focus:outline-none ${props.className ?? ""}`}
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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-line-subtle bg-void px-3 py-2 font-mono text-sm text-ink-primary focus:border-brand-primary/50 focus:outline-none ${className ?? ""}`}
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
  return (
    <label className="block">
      <div className="mb-1.5 flex justify-between font-mono text-xs text-ink-secondary">
        <span>{label}</span>
        <span className="text-brand-primary">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-void-card accent-brand-primary"
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
      className="flex w-full items-center justify-between rounded-lg border border-line-subtle bg-void px-3 py-2 text-left"
      aria-pressed={checked}
    >
      <span className="font-mono text-xs text-ink-secondary">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-primary" : "bg-line-strong"}`}
      >
        <motion.span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-void-elevated shadow"
          animate={{ x: checked ? 18 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">Try:</span>
      {scenarios.map((s) => (
        <button
          key={s.label}
          onClick={s.onClick}
          className="rounded-full border border-line-subtle px-3 py-1 font-mono text-[11px] text-ink-secondary transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
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
    cyan: "text-brand-primary",
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red",
  };
  return (
    <div>
      <div className={`font-mono text-xl font-semibold sm:text-2xl ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-tertiary">{label}</div>
    </div>
  );
}

export function PgNote({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs leading-relaxed text-ink-tertiary">⚠ {children}</p>;
}
