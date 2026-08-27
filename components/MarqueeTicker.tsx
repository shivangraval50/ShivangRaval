import { PROJECTS } from "@/data/projects";

const ITEMS = [
  "149K MATCHED EVENTS/SEC · MARKET SIMULATOR",
  "2.95× MEASURED SPEEDUP · DISTRIBUTED TRAINING",
  "74.3% FILL IMPROVEMENT · SMART ORDER ROUTER",
  "66.7K EVENTS/SEC · STREAMING PIPELINE",
  `${PROJECTS.length} PROJECTS SHIPPED`,
  "SUB-10MS CACHED · RAG + RLHF",
  "4 LANGUAGES · PYTHON C++ OCAML TYPESCRIPT",
];

/**
 * Metrics ticker.
 *
 * Kept, because the items are content. Restrained per HIG "Motion": the loop is
 * now 60s rather than 32s, the type is quiet, and the whole thing pauses on
 * hover or keyboard focus so it can't distract while you read the page. Under
 * Reduce Motion it stops dead (see globals.css) rather than snapping to its end
 * position.
 */
export default function MarqueeTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div
      className="group relative overflow-hidden border-y border-line-subtle bg-void-surface py-3.5"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {loop.map((item, i) => (
          <span key={i} className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink-tertiary">
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-void-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-void-surface to-transparent" />
    </div>
  );
}
