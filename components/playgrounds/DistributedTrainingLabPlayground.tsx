"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgSelect, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

type Strategy = "ddp" | "fsdp" | "tp" | "pp";

const STRATEGY_OPTIONS: { value: Strategy; label: string }[] = [
  { value: "ddp", label: "DDP" },
  { value: "fsdp", label: "FSDP" },
  { value: "tp", label: "Tensor Parallel" },
  { value: "pp", label: "Pipeline Parallel" },
];

const STRATEGY_LABEL: Record<Strategy, string> = {
  ddp: "DDP",
  fsdp: "FSDP",
  tp: "Tensor Parallel",
  pp: "Pipeline Parallel",
};

const TOTAL_LAYERS = 12;
const MATRIX_SIZE = 8;

interface SplitGroup {
  start: number;
  end: number;
  size: number;
}

// Splits `total` 1..N contiguous items as evenly as possible across `parts`
// groups (e.g. 12 layers across 4 stages -> 3/3/3/3; 12 layers across 8
// stages -> four stages of 2 then four of 1). Shared by pipeline-parallel
// layer ranges and tensor-parallel column groups so every number rendered
// below is derived live from the rank slider, never hardcoded for one N.
function splitContiguous(total: number, parts: number): SplitGroup[] {
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  const groups: SplitGroup[] = [];
  let cursor = 0;
  for (let i = 0; i < parts; i++) {
    const size = base + (i < remainder ? 1 : 0);
    const start = cursor + 1;
    const end = cursor + size;
    groups.push({ start, end, size });
    cursor = end;
  }
  return groups;
}

function formatPercent(pct: number): string {
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

function formatSizeRange(sizes: number[]): string {
  const unique = Array.from(new Set(sizes));
  if (unique.length === 1) return `${unique[0]} each`;
  return `${Math.min(...unique)}–${Math.max(...unique)}`;
}

function groupShade(index: number, count: number): number {
  if (count <= 1) return 1;
  return 0.32 + (index / (count - 1)) * 0.68;
}

function rankGridStyle(ranks: number): CSSProperties {
  return { gridTemplateColumns: `repeat(${ranks}, minmax(0, 1fr))` };
}

function stepDuration(strategy: Strategy, ranks: number): number {
  if (strategy === "pp") return ranks * 320 + 500;
  if (strategy === "fsdp") return 1600;
  if (strategy === "tp") return 1500;
  return 1300;
}

function getStrategyStats(
  strategy: Strategy,
  ranks: number,
  stepId: number
): { label: string; value: string; tone: "cyan" | "green" | "amber" | "red" }[] {
  const stepsRun = { label: "Steps run", value: `${stepId}`, tone: "cyan" as const };

  if (strategy === "ddp") {
    return [
      { label: "Params per rank", value: "100%", tone: "cyan" },
      { label: "Replicas", value: `${ranks}`, tone: "cyan" },
      { label: "Collective op", value: "all-reduce", tone: "cyan" },
      stepsRun,
    ];
  }
  if (strategy === "fsdp") {
    return [
      { label: "Params per rank", value: formatPercent(100 / ranks), tone: "green" },
      { label: "Shards", value: `${ranks}`, tone: "green" },
      { label: "Collective ops", value: "all-gather + reduce-scatter", tone: "green" },
      stepsRun,
    ];
  }
  if (strategy === "tp") {
    const groups = splitContiguous(MATRIX_SIZE, ranks);
    return [
      { label: "Matrix shape", value: `${MATRIX_SIZE}×${MATRIX_SIZE}`, tone: "amber" },
      { label: "Column groups", value: `${ranks}`, tone: "amber" },
      { label: "Columns per rank", value: formatSizeRange(groups.map((g) => g.size)), tone: "amber" },
      stepsRun,
    ];
  }
  const stages = splitContiguous(TOTAL_LAYERS, ranks);
  return [
    { label: "Total layers", value: `${TOTAL_LAYERS}`, tone: "amber" },
    { label: "Pipeline stages", value: `${ranks}`, tone: "amber" },
    { label: "Layers per stage", value: formatSizeRange(stages.map((s) => s.size)), tone: "amber" },
    stepsRun,
  ];
}

function DdpDiagram({ ranks, stepId }: { ranks: number; stepId: number }) {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (stepId === 0) return;
    setSyncing(true);
    const t = window.setTimeout(() => setSyncing(false), 1100);
    return () => window.clearTimeout(t);
  }, [stepId]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3" style={rankGridStyle(ranks)}>
        <AnimatePresence initial={false}>
          {Array.from({ length: ranks }, (_, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: syncing ? 1.04 : 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className={`rounded-lg border bg-void-card p-3 text-center transition-colors duration-300 ${
                syncing ? "border-signal-cyan" : "border-line-subtle"
              }`}
            >
              <div className="font-mono text-[11px] text-ink-tertiary">Rank {i}</div>
              <div className="mt-1 font-mono text-sm font-semibold text-signal-cyan">100%</div>
              <div className="font-mono text-[10px] text-ink-tertiary">of params (full replica)</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full border border-line-subtle bg-void">
        <AnimatePresence>
          {syncing && (
            <motion.div
              key={stepId}
              className="absolute inset-y-0 w-1/3 rounded-full bg-signal-cyan"
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: ["0%", "67%", "0%"], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="text-center font-mono text-[11px] text-signal-cyan">
        {syncing ? "⇄ all-reduce gradients across all ranks" : "click Step to run all-reduce on the gradients"}
      </p>
    </div>
  );
}

function FsdpDiagram({ ranks, stepId }: { ranks: number; stepId: number }) {
  const [phase, setPhase] = useState<"idle" | "gather" | "scatter">("idle");

  useEffect(() => {
    if (stepId === 0) return;
    setPhase("gather");
    const t1 = window.setTimeout(() => setPhase("scatter"), 700);
    const t2 = window.setTimeout(() => setPhase("idle"), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [stepId]);

  const pctLabel = formatPercent(100 / ranks);

  return (
    <div className="space-y-4">
      <div className="grid gap-3" style={rankGridStyle(ranks)}>
        <AnimatePresence initial={false}>
          {Array.from({ length: ranks }, (_, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: phase !== "idle" ? 1.04 : 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className={`rounded-lg border bg-void-card p-3 text-center transition-colors duration-300 ${
                phase !== "idle" ? "border-signal-green" : "border-line-subtle"
              }`}
            >
              <div className="font-mono text-[11px] text-ink-tertiary">Rank {i}</div>
              <div className="mt-1 font-mono text-sm font-semibold text-signal-green">{pctLabel}</div>
              <div className="font-mono text-[10px] text-ink-tertiary">of params (shard {i})</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full border border-line-subtle bg-void">
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              key={`${stepId}-${phase}`}
              className="absolute inset-y-0 w-1/3 rounded-full bg-signal-green"
              initial={{ left: phase === "gather" ? "0%" : "67%", opacity: 0 }}
              animate={{ left: phase === "gather" ? "67%" : "0%", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="text-center font-mono text-[11px] text-signal-green">
        {phase === "gather" && "→ all-gather full params for this step"}
        {phase === "scatter" && "← reduce-scatter gradients back to shards"}
        {phase === "idle" && "click Step to run a forward + backward step"}
      </p>
    </div>
  );
}

function TensorParallelDiagram({ ranks, stepId }: { ranks: number; stepId: number }) {
  const [phase, setPhase] = useState<"idle" | "compute" | "gather">("idle");

  useEffect(() => {
    if (stepId === 0) return;
    setPhase("compute");
    const t1 = window.setTimeout(() => setPhase("gather"), 650);
    const t2 = window.setTimeout(() => setPhase("idle"), 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [stepId]);

  const groups = splitContiguous(MATRIX_SIZE, ranks);
  const colToRank: number[] = [];
  groups.forEach((g, gi) => {
    for (let c = g.start; c <= g.end; c++) colToRank[c - 1] = gi;
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
          Weight matrix ({MATRIX_SIZE}×{MATRIX_SIZE}) — column-parallel across {ranks} ranks
        </div>
        <motion.div
          layout
          animate={{ opacity: phase === "compute" ? [1, 0.55, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${MATRIX_SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }, (_, idx) => {
            const col = idx % MATRIX_SIZE;
            const rankIdx = colToRank[col] ?? 0;
            return (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-[2px] border border-line-subtle"
              >
                <div
                  className="absolute inset-0 bg-signal-violet transition-opacity duration-300"
                  style={{ opacity: groupShade(rankIdx, ranks) }}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="grid gap-3" style={rankGridStyle(ranks)}>
        <AnimatePresence initial={false}>
          {groups.map((g, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-lg border border-line-subtle bg-void-card p-3 text-center"
            >
              <div
                className="mx-auto mb-1 h-1.5 w-6 rounded-full bg-signal-violet"
                style={{ opacity: groupShade(i, ranks) }}
              />
              <div className="font-mono text-[11px] text-ink-tertiary">Rank {i}</div>
              <div className="mt-1 font-mono text-xs font-semibold text-signal-violet">
                cols {g.start}–{g.end}
              </div>
              <div className="font-mono text-[10px] text-ink-tertiary">
                {g.size} of {MATRIX_SIZE} columns
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full border border-line-subtle bg-void">
        <AnimatePresence>
          {phase === "gather" && (
            <motion.div
              key={stepId}
              className="absolute inset-y-0 w-1/3 rounded-full bg-signal-violet"
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: "67%", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="text-center font-mono text-[11px] text-signal-violet">
        {phase === "compute" && "local matmul on each rank's own column slice"}
        {phase === "gather" && "→ all-gather partial outputs into the full activation"}
        {phase === "idle" && "click Step to run a forward pass"}
      </p>
    </div>
  );
}

function PipelineParallelDiagram({ ranks, stepId }: { ranks: number; stepId: number }) {
  const [tokenStage, setTokenStage] = useState(-1);

  useEffect(() => {
    if (stepId === 0) return;
    const stageMs = 320;
    const timeouts: number[] = [];
    for (let i = 0; i < ranks; i++) {
      timeouts.push(window.setTimeout(() => setTokenStage(i), i * stageMs));
    }
    timeouts.push(window.setTimeout(() => setTokenStage(-1), ranks * stageMs + 260));
    return () => timeouts.forEach((t) => window.clearTimeout(t));
  }, [stepId, ranks]);

  const stages = splitContiguous(TOTAL_LAYERS, ranks);

  return (
    <div className="space-y-4">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
        {ranks} sequential stages — {TOTAL_LAYERS} layers split contiguously
      </div>
      <div className="relative">
        <div className="grid gap-3" style={rankGridStyle(ranks)}>
          <AnimatePresence initial={false}>
            {stages.map((s, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`rounded-lg border bg-void-card p-3 text-center transition-colors duration-200 ${
                  tokenStage === i ? "border-signal-amber" : "border-line-subtle"
                }`}
              >
                <div className="font-mono text-[11px] text-ink-tertiary">Stage {i}</div>
                <div className="mt-1 font-mono text-xs font-semibold text-signal-amber">
                  layers {s.start}–{s.end}
                </div>
                <div className="font-mono text-[10px] text-ink-tertiary">
                  {s.size} layer{s.size > 1 ? "s" : ""}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {tokenStage >= 0 && (
          <motion.div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-amber shadow-[0_0_8px_rgba(240,180,41,0.6)]"
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: `${(tokenStage + 0.5) * (100 / ranks)}%`, opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          />
        )}
      </div>

      <p className="text-center font-mono text-[11px] text-signal-amber">
        {tokenStage >= 0
          ? `micro-batch flowing through stage ${tokenStage}`
          : "click Step to send a micro-batch through the pipeline"}
      </p>
    </div>
  );
}

export default function DistributedTrainingLabPlayground() {
  const [strategy, setStrategy] = useState<Strategy>("ddp");
  const [ranks, setRanks] = useState(4);
  const [stepId, setStepId] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (busyTimeout.current !== null) window.clearTimeout(busyTimeout.current);
    };
  }, []);

  function handleStep() {
    setStepId((c) => c + 1);
    setBusy(true);
    if (busyTimeout.current !== null) window.clearTimeout(busyTimeout.current);
    busyTimeout.current = window.setTimeout(() => setBusy(false), stepDuration(strategy, ranks));
  }

  const stats = getStrategyStats(strategy, ranks, stepId);

  return (
    <PgShell>
      <PgPanel title="Configuration">
        <div className="space-y-4">
          <PgSelect value={strategy} onChange={(v) => setStrategy(v as Strategy)} options={STRATEGY_OPTIONS} />

          <PgSlider
            label="Number of ranks (N)"
            value={ranks}
            min={2}
            max={8}
            step={1}
            onChange={setRanks}
            format={(v) => `${v} ranks`}
          />

          <ScenarioBar
            scenarios={STRATEGY_OPTIONS.map((o) => ({ label: o.label, onClick: () => setStrategy(o.value) }))}
          />

          <PgButton onClick={handleStep} disabled={busy}>
            {busy ? "Stepping…" : "Step"}
          </PgButton>

          <PgNote>
            Verified for numerical correctness on CPU (gloo backend) across all 4 strategies shown
            here — DDP, FSDP, tensor parallel, and pipeline parallel each match a single-process
            reference run to within float precision. Real multi-GPU throughput hasn&apos;t been
            measured yet; this view shows how parameters and activations actually get split and
            synchronized for the strategy and rank count you pick, not a performance claim.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title={`Live diagram — ${STRATEGY_LABEL[strategy]}`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <StatValue key={s.label} label={s.label} value={s.value} tone={s.tone} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={strategy}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-5 border-t border-line-subtle pt-4"
          >
            {strategy === "ddp" && <DdpDiagram ranks={ranks} stepId={stepId} />}
            {strategy === "fsdp" && <FsdpDiagram ranks={ranks} stepId={stepId} />}
            {strategy === "tp" && <TensorParallelDiagram ranks={ranks} stepId={stepId} />}
            {strategy === "pp" && <PipelineParallelDiagram ranks={ranks} stepId={stepId} />}
          </motion.div>
        </AnimatePresence>
      </PgPanel>
    </PgShell>
  );
}
