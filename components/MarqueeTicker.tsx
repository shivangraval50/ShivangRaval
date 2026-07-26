const ITEMS = [
  "149K MATCHED EVENTS/SEC · MARKET SIMULATOR",
  "2.95× MEASURED SPEEDUP · DISTRIBUTED TRAINING",
  "74.3% FILL IMPROVEMENT · SMART ORDER ROUTER",
  "66.7K EVENTS/SEC · STREAMING PIPELINE",
  "20 PROJECTS SHIPPED",
  "SUB-10MS CACHED · RAG + RLHF",
  "4 LANGUAGES · PYTHON C++ OCAML TYPESCRIPT",
];

export default function MarqueeTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-line-subtle bg-void-surface/60 py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {loop.map((item, i) => (
          <span key={i} className="font-mono text-xs tracking-wider text-ink-tertiary">
            <span className="text-signal-green">▲</span> {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}
