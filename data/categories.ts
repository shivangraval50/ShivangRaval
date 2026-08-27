import { Cpu, MessageSquare, LineChart, Terminal, Layers } from "lucide-react";
import type { CategoryMeta, ProjectCategory } from "@/types/project";

/**
 * Presentation metadata for the five project domains. Labels, ids and icons are
 * unchanged; only the colour treatment was retuned.
 *
 * HIG "Color": colour should carry meaning and be used judiciously. The domain
 * hue survives as a low-saturation tint on the chip (identity at a glance), but
 * the full-bleed neon gradient bar that used to cap every card is gone — it
 * communicated nothing that the labelled, icon-bearing chip doesn't already
 * say, and HIG "Accessibility" requires the distinction be carried by more than
 * colour anyway. `gradient` is retained as an empty string so the type and any
 * consumer stay valid.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: "ai-infra",
    label: "AI / ML Infra",
    accent: "text-signal-violet",
    accentSoft: "bg-signal-violet/[0.10] ring-signal-violet/20",
    gradient: "",
    icon: Cpu,
  },
  {
    id: "nlp",
    label: "NLP & Applied ML",
    accent: "text-signal-amber",
    accentSoft: "bg-signal-amber/[0.10] ring-signal-amber/20",
    gradient: "",
    icon: MessageSquare,
  },
  {
    id: "quant",
    label: "Quant Trading",
    accent: "text-signal-cyan",
    accentSoft: "bg-signal-cyan/[0.10] ring-signal-cyan/20",
    gradient: "",
    icon: LineChart,
  },
  {
    id: "systems",
    label: "Systems & Languages",
    accent: "text-signal-emerald",
    accentSoft: "bg-signal-emerald/[0.10] ring-signal-emerald/20",
    gradient: "",
    icon: Terminal,
  },
  {
    id: "apps",
    label: "Applied Apps",
    accent: "text-signal-rose",
    accentSoft: "bg-signal-rose/[0.10] ring-signal-rose/20",
    gradient: "",
    icon: Layers,
  },
];

export function getCategory(id: ProjectCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
