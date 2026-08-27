"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

interface PriceLevel {
  price: number;
  size: number;
}

const CHUNK_SIZE = 8;
const MIN_FILL_SIZE = 500;
const DEFAULT_DEPTH = 1000;

// Generates a fresh synthetic ask ladder every call — nothing here is cached
// or replayed, so every "Scan" click genuinely re-benchmarks new data.
function generateBook(depth: number): PriceLevel[] {
  const levels: PriceLevel[] = new Array(depth);
  let price = 100 + Math.random() * 50;
  for (let i = 0; i < depth; i++) {
    price += Math.random() * 0.05 + 0.001;
    levels[i] = { price, size: 1 + Math.floor(Math.random() * 1000) };
  }
  return levels;
}

// Naive linear scan: walk every level, keep the lowest price that can fill
// at least minSize shares.
function naiveScan(levels: PriceLevel[], minSize: number): PriceLevel | null {
  let best: PriceLevel | null = null;
  for (let i = 0; i < levels.length; i++) {
    const lvl = levels[i];
    if (lvl.size >= minSize && (best === null || lvl.price < best.price)) {
      best = lvl;
    }
  }
  return best;
}

// Same scan, restructured to walk fixed-size chunks at a time — an
// illustrative in-browser stand-in for the batched/SIMD price-scan idea in
// the real C++ engine (which processes multiple levels per NEON/AVX2
// instruction). This is still scalar JS; it changes loop structure, not
// instruction-level parallelism.
function chunkedScan(levels: PriceLevel[], minSize: number, chunkSize: number): PriceLevel | null {
  let best: PriceLevel | null = null;
  const n = levels.length;
  let i = 0;
  for (; i + chunkSize <= n; i += chunkSize) {
    for (let j = 0; j < chunkSize; j++) {
      const lvl = levels[i + j];
      if (lvl.size >= minSize && (best === null || lvl.price < best.price)) {
        best = lvl;
      }
    }
  }
  for (; i < n; i++) {
    const lvl = levels[i];
    if (lvl.size >= minSize && (best === null || lvl.price < best.price)) {
      best = lvl;
    }
  }
  return best;
}

interface ScanRunResult {
  depth: number;
  trials: number;
  naiveMs: number;
  chunkedMs: number;
  bestPrice: number | null;
  matched: boolean;
}

// Runs both algorithms several times over the *same* generated book and
// averages, so timing is stable rather than one noisy sample. Trial count
// is scaled inversely with depth to keep total work roughly constant across
// the whole 100–10,000 slider range.
function runScan(depth: number): ScanRunResult {
  const levels = generateBook(depth);
  const trials = Math.max(20, Math.round(1_000_000 / depth));

  // Warm-up pass so neither algorithm eats a one-time JIT-compile cost inside
  // the timed loop below.
  naiveScan(levels, MIN_FILL_SIZE);
  chunkedScan(levels, MIN_FILL_SIZE, CHUNK_SIZE);

  let naiveResult: PriceLevel | null = null;
  const naiveStart = performance.now();
  for (let t = 0; t < trials; t++) {
    naiveResult = naiveScan(levels, MIN_FILL_SIZE);
  }
  const naiveMs = (performance.now() - naiveStart) / trials;

  let chunkedResult: PriceLevel | null = null;
  const chunkedStart = performance.now();
  for (let t = 0; t < trials; t++) {
    chunkedResult = chunkedScan(levels, MIN_FILL_SIZE, CHUNK_SIZE);
  }
  const chunkedMs = (performance.now() - chunkedStart) / trials;

  return {
    depth,
    trials,
    naiveMs,
    chunkedMs,
    bestPrice: naiveResult ? naiveResult.price : null,
    matched: (naiveResult?.price ?? null) === (chunkedResult?.price ?? null),
  };
}

export default function LowLatencyExecPlayground() {
  const [depth, setDepth] = useState(DEFAULT_DEPTH);
  const [result, setResult] = useState<ScanRunResult>(() => runScan(DEFAULT_DEPTH));
  const [runSeq, setRunSeq] = useState(0);

  function scan(d: number) {
    setResult(runScan(d));
    setRunSeq((c) => c + 1);
  }

  function runScenario(d: number) {
    setDepth(d);
    scan(d);
  }

  const speedup = result.chunkedMs > 0 ? result.naiveMs / result.chunkedMs : null;

  return (
    <PgShell>
      <PgPanel title="Synthetic order book">
        <div className="space-y-4">
          <PgSlider
            label="Order-book depth"
            value={depth}
            min={100}
            max={10000}
            step={100}
            onChange={setDepth}
            format={(v) => `${v.toLocaleString()} levels`}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ScenarioBar
              scenarios={[
                { label: "Small book (100)", onClick: () => runScenario(100) },
                { label: "Large book (10,000)", onClick: () => runScenario(10000) },
              ]}
            />
            <PgButton onClick={() => scan(depth)}>Scan for best price ▸</PgButton>
          </div>
          <p className="font-mono text-[0.6471rem] text-ink-tertiary">
            Each click generates a brand-new random ask ladder at this depth (min fill size {MIN_FILL_SIZE} shares),
            then times {result.trials.toLocaleString()} repeated scans of it with <code>performance.now()</code>.
          </p>
        </div>
      </PgPanel>

      <PgPanel title="Result">
        <div className="flex min-h-[200px] flex-col justify-between gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={runSeq}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              <StatValue
                label="Best price found"
                value={result.bestPrice !== null ? `$${result.bestPrice.toFixed(2)}` : "no fill"}
                tone="cyan"
              />
              <StatValue label="Naive scan" value={`${result.naiveMs.toFixed(4)}ms`} tone="cyan" />
              <StatValue label="Chunked scan (×8)" value={`${result.chunkedMs.toFixed(4)}ms`} tone="cyan" />
              <StatValue
                label="Speedup (chunked vs naive)"
                value={speedup !== null ? `${speedup.toFixed(2)}×` : "—"}
                tone={speedup !== null && speedup >= 1 ? "green" : "amber"}
              />
            </motion.div>
          </AnimatePresence>

          <div className="border-t border-line-subtle pt-3 font-mono text-[0.6471rem] text-ink-tertiary">
            {result.matched
              ? "✓ both algorithms agree on the best price — correctness holds at this depth."
              : "⚠ algorithms disagreed on this run — unexpected, re-scan to check."}
          </div>

          <PgNote>
            This times two real JavaScript scans over freshly generated data in your browser — not the real C++
            engine. &quot;Chunked&quot; walks the book 8 levels at a time as an illustrative stand-in for the
            SIMD-batching idea in the real engine, then both results are cross-checked for agreement. Treat any
            speedup here as an in-browser illustration of the batching concept, not a benchmark of the real engine:
            that C++ matching engine has 500/500-trial NEON correctness verification but no published p50/p99/p99.9
            latency numbers yet — the percentile harness is built but hasn&apos;t been run as a controlled benchmark,
            and there&apos;s no local x86 hardware to exercise the AVX2 path at all.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
