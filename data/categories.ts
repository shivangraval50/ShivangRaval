import type { CategoryMeta, ProjectCategory } from "@/types/project";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "quant",
    label: "Quant Trading",
    accent: "text-signal-cyan",
    accentSoft: "bg-signal-cyan/10 border-signal-cyan/30",
    gradient: "from-signal-cyan to-signal-blue",
  },
  {
    id: "ai-infra",
    label: "AI / ML Infra",
    accent: "text-signal-violet",
    accentSoft: "bg-signal-violet/10 border-signal-violet/30",
    gradient: "from-signal-violet to-signal-fuchsia",
  },
  {
    id: "nlp",
    label: "NLP & Applied ML",
    accent: "text-signal-amber",
    accentSoft: "bg-signal-amber/10 border-signal-amber/30",
    gradient: "from-signal-amber to-signal-orange",
  },
  {
    id: "systems",
    label: "Systems & Languages",
    accent: "text-signal-emerald",
    accentSoft: "bg-signal-emerald/10 border-signal-emerald/30",
    gradient: "from-signal-emerald to-signal-green",
  },
  {
    id: "apps",
    label: "Applied Apps",
    accent: "text-signal-rose",
    accentSoft: "bg-signal-rose/10 border-signal-rose/30",
    gradient: "from-signal-rose to-signal-pink",
  },
];

export function getCategory(id: ProjectCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
