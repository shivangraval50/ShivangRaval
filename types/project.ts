export type MetricStatus = "measured" | "projected" | "stubbed";

export interface ProjectMetric {
  label: string;
  value: string;
  status?: MetricStatus;
}

export interface TerminalLine {
  type: "command" | "output" | "comment";
  text: string;
}

export interface TerminalDemo {
  kind: "terminal";
  lines: TerminalLine[];
}

export interface MetricsDemo {
  kind: "metrics";
  metrics: ProjectMetric[];
  chart?: { label: string; value: number }[];
}

export type Demo = TerminalDemo | MetricsDemo;

export type ProjectCategory = "quant" | "ai-infra" | "nlp" | "systems" | "apps";

export interface CategoryMeta {
  id: ProjectCategory;
  label: string;
  accent: string;
  accentSoft: string;
  gradient: string;
}

export interface Project {
  id: string;
  title: string;
  pitch: string;
  description: string;
  category: ProjectCategory;
  tech: string[];
  metrics: ProjectMetric[];
  demo: Demo;
  github: string;
  homepage?: string;
  featured?: boolean;
  accuracyNote?: string;
}
