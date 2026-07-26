"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PgShell, PgPanel, PgSlider, PgToggle, ScenarioBar, StatValue, PgNote } from "./ui";

// Multipliers below are the actual CPU-measured numbers from this repo's own
// serving-technique benchmarks (see the llm-inference-engine project card) —
// not estimates. Continuous batching genuinely divides latency; the other
// three genuinely multiply it. Toggling any control recomputes the product
// live rather than looking up a canned per-scenario answer.
type ToggleKey = "batching" | "pagedKv" | "quantization" | "speculative";

interface ToggleState {
  batching: boolean;
  pagedKv: boolean;
  quantization: boolean;
  speculative: boolean;
}

const ALL_OFF: ToggleState = {
  batching: false,
  pagedKv: false,
  quantization: false,
  speculative: false,
};

interface TechniqueInfo {
  key: ToggleKey;
  label: string;
  short: string;
  note: string;
  kind: "speedup" | "slowdown";
  factor: number;
}

const TECHNIQUES: TechniqueInfo[] = [
  {
    key: "batching",
    label: "Continuous batching (8 concurrent reqs) — 1.64× faster",
    short: "Continuous batching",
    note: "8 concurrent requests served in one running batch",
    kind: "speedup",
    factor: 1.64,
  },
  {
    key: "pagedKv",
    label: "Paged KV-cache — 32% slower on CPU",
    short: "Paged KV-cache",
    note: "paging overhead with no GPU memory pressure to offset it",
    kind: "slowdown",
    factor: 1.32,
  },
  {
    key: "quantization",
    label: "INT8 quantization — 2.12× slower on CPU",
    short: "INT8 quantization",
    note: "no fast low-bit GEMM kernels available on this CPU",
    kind: "slowdown",
    factor: 2.12,
  },
  {
    key: "speculative",
    label: "Speculative decoding — 1.28× slower on CPU",
    short: "Speculative decoding",
    note: "untrained draft/target pair — acceptance-rate gains don't show up",
    kind: "slowdown",
    factor: 1.28,
  },
];

type Tone = "cyan" | "green" | "amber" | "red";

const TONE_BG: Record<Tone, string> = {
  cyan: "bg-signal-cyan",
  green: "bg-signal-green",
  amber: "bg-signal-amber",
  red: "bg-signal-red",
};

const TONE_TEXT: Record<Tone, string> = {
  cyan: "text-signal-cyan",
  green: "text-signal-green",
  amber: "text-signal-amber",
  red: "text-signal-red",
};

function toneForMultiplier(m: number): Tone {
  if (m < 0.999) return "green";
  if (m <= 1.001) return "cyan";
  if (m < 1.5) return "amber";
  return "red";
}

function computeMultiplier(toggles: ToggleState): number {
  return TECHNIQUES.reduce((acc, t) => {
    if (!toggles[t.key]) return acc;
    const effective = t.kind === "speedup" ? 1 / t.factor : t.factor;
    return acc * effective;
  }, 1);
}

export default function LLMInferenceEnginePlayground() {
  const [baselineMs, setBaselineMs] = useState(200);
  const [toggles, setToggles] = useState<ToggleState>(ALL_OFF);

  const multiplier = computeMultiplier(toggles);
  const resultMs = baselineMs * multiplier;
  const tone = toneForMultiplier(multiplier);
  const activeTechniques = TECHNIQUES.filter((t) => toggles[t.key]);

  const scale = Math.max(baselineMs, resultMs, 1) * 1.05;
  const baselinePct = (baselineMs / scale) * 100;
  const resultPct = (resultMs / scale) * 100;

  function setToggle(key: ToggleKey, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }

  const scenarios = [
    { label: "Naive baseline", onClick: () => setToggles(ALL_OFF) },
    { label: "Batching only", onClick: () => setToggles({ ...ALL_OFF, batching: true }) },
    {
      label: "Everything stacked",
      onClick: () => setToggles({ batching: true, pagedKv: true, quantization: true, speculative: true }),
    },
  ];

  return (
    <PgShell>
      <PgPanel title="Serving techniques">
        <div className="space-y-4">
          <PgSlider
            label="Baseline latency"
            value={baselineMs}
            min={50}
            max={500}
            step={10}
            onChange={setBaselineMs}
            format={(v) => `${v}ms`}
          />

          <div className="space-y-2">
            {TECHNIQUES.map((t) => (
              <PgToggle key={t.key} label={t.label} checked={toggles[t.key]} onChange={(v) => setToggle(t.key, v)} />
            ))}
          </div>

          <ScenarioBar scenarios={scenarios} />
        </div>
      </PgPanel>

      <PgPanel title="Latency result">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatValue label="Baseline" value={`${baselineMs.toFixed(0)}ms`} tone="cyan" />
            <StatValue label="Resulting latency" value={`${resultMs.toFixed(1)}ms`} tone={tone} />
            <StatValue label="Relative latency" value={`${multiplier.toFixed(2)}×`} tone={tone} />
            <StatValue
              label="Net effect"
              value={multiplier < 0.999 ? "Faster" : multiplier > 1.001 ? "Slower" : "No change"}
              tone={tone}
            />
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between font-mono text-[11px] text-ink-tertiary">
                <span>Baseline</span>
                <span>{baselineMs.toFixed(0)}ms</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-void-card">
                <motion.div
                  className="h-full rounded-full bg-signal-cyan"
                  animate={{ width: `${baselinePct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between font-mono text-[11px] text-ink-tertiary">
                <span>With selected techniques</span>
                <span className={TONE_TEXT[tone]}>{resultMs.toFixed(1)}ms</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-void-card">
                <motion.div
                  className={`h-full rounded-full ${TONE_BG[tone]}`}
                  animate={{ width: `${resultPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-line-subtle pt-4">
            <div className="font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
              {activeTechniques.length === 0
                ? "No techniques active — pure baseline"
                : `${activeTechniques.length} technique${activeTechniques.length > 1 ? "s" : ""} applied`}
            </div>
            {activeTechniques.length > 0 && (
              <div className="space-y-2">
                {activeTechniques.map((t) => (
                  <div
                    key={t.key}
                    className="flex items-center justify-between rounded-lg border border-line-subtle bg-void p-3"
                  >
                    <div>
                      <div className="font-mono text-xs text-ink-primary">{t.short}</div>
                      <div className="text-[11px] text-ink-tertiary">{t.note}</div>
                    </div>
                    <div
                      className={`font-mono text-xs ${t.kind === "speedup" ? "text-signal-green" : "text-signal-red"}`}
                    >
                      {t.kind === "speedup" ? `÷${t.factor.toFixed(2)}` : `×${t.factor.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PgNote>
            These four multipliers are the actual CPU-measured numbers from this project&apos;s own
            benchmark suite (a randomly-initialized, untrained model on one machine) — not
            estimates. Continuous batching is a genuine win with no special hardware required.
            Paged KV-cache and INT8 quantization show overhead here specifically because their
            real benefit — memory efficiency, and real low-bit GEMM kernels — needs GPU
            hardware this project hasn&apos;t benchmarked on yet. Speculative decoding was measured
            with an untrained draft/target pair, so the acceptance-rate gains that make it a win in
            production don&apos;t show up in this number.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
