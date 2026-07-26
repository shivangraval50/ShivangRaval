"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

// The only real measurement in this repo: 4 CPU processes (not GPUs),
// 8.47s -> 2.87s, i.e. 2.95x.
const REAL_WORKERS = 4;
const REAL_SPEEDUP = 2.95;
const MAX_WORKERS = 16;

// Parallel-efficiency model: speedup(n) = n / (1 + k*(n-1)).
// Solve k algebraically so speedup(REAL_WORKERS) == REAL_SPEEDUP exactly:
//   k = (REAL_WORKERS / REAL_SPEEDUP - 1) / (REAL_WORKERS - 1)
const K = (REAL_WORKERS / REAL_SPEEDUP - 1) / (REAL_WORKERS - 1);

function calibratedSpeedup(n: number): number {
  return n / (1 + K * (n - 1));
}

function naiveLinearSpeedup(n: number): number {
  return n;
}

const CHART_MAX = naiveLinearSpeedup(MAX_WORKERS);

const BARS = Array.from({ length: MAX_WORKERS }, (_, i) => {
  const n = i + 1;
  return {
    n,
    calibratedPct: (calibratedSpeedup(n) / CHART_MAX) * 100,
    naivePct: (naiveLinearSpeedup(n) / CHART_MAX) * 100,
  };
});

export default function DistributedMLTrainingPlayground() {
  const [workers, setWorkers] = useState(REAL_WORKERS);

  const calibrated = useMemo(() => calibratedSpeedup(workers), [workers]);
  const naive = naiveLinearSpeedup(workers);
  const efficiencyPct = (calibrated / workers) * 100;
  const isRealPoint = workers === REAL_WORKERS;
  const asymptoticCeiling = 1 / K;

  return (
    <PgShell>
      <PgPanel title="Worker count">
        <div className="space-y-4">
          <PgSlider
            label="Number of workers (CPU processes)"
            value={workers}
            min={1}
            max={MAX_WORKERS}
            step={1}
            onChange={setWorkers}
            format={(v) => `${v}`}
          />

          <ScenarioBar
            scenarios={[
              { label: "4 workers (the real measurement)", onClick: () => setWorkers(REAL_WORKERS) },
              { label: "12 workers (repo's GPU projection point)", onClick: () => setWorkers(12) },
            ]}
          />

          <div>
            <div className="mb-1.5 flex items-end gap-[3px]" aria-hidden="true">
              {BARS.map((b) => (
                <div key={b.n} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative h-24 w-full overflow-hidden rounded-sm bg-void">
                    <div
                      className="absolute inset-x-0 bottom-0 bg-signal-red/30 transition-[height] duration-300"
                      style={{ height: `${b.naivePct}%` }}
                    />
                    <div
                      className={`absolute inset-x-0 bottom-0 transition-[height] duration-300 ${
                        b.n === REAL_WORKERS ? "bg-signal-green" : "bg-signal-amber"
                      }`}
                      style={{ height: `${b.calibratedPct}%` }}
                    />
                    {b.n === workers && <div className="absolute inset-0 rounded-sm ring-2 ring-signal-cyan" />}
                  </div>
                  <span className="font-mono text-[9px] text-ink-tertiary">{b.n}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-ink-tertiary">
              red = naive linear reference (n) · amber/green = calibrated model · green bar (n=4) = the one real
              measurement · cyan ring = your current slider position
            </p>
          </div>
        </div>
      </PgPanel>

      <PgPanel title="Speedup at your chosen worker count">
        <div className="flex min-h-[220px] flex-col justify-between gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={workers}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatValue
                  label={isRealPoint ? "Calibrated speedup — real measurement" : "Calibrated projected speedup"}
                  value={`${calibrated.toFixed(2)}×`}
                  tone={isRealPoint ? "green" : "amber"}
                />
                <StatValue label="Naive linear scaling" value={`${naive.toFixed(2)}×`} tone="red" />
                <StatValue label="Parallel efficiency" value={`${efficiencyPct.toFixed(0)}%`} tone="cyan" />
                <StatValue label="Asymptotic ceiling (n→∞)" value={`${asymptoticCeiling.toFixed(2)}×`} tone="cyan" />
              </div>

              {workers === 12 && (
                <p className="rounded-lg border border-signal-amber/30 bg-void p-3 font-mono text-[11px] leading-relaxed text-signal-amber">
                  At 12 workers, this calibrated model projects {calibrated.toFixed(2)}×. The repo&apos;s own README
                  instead shows two disagreeing figures for 12 GPUs in the same document — 10.6× and 13.3× — neither
                  of which is derived from this (or any) calibration.
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <PgNote>
            The only real measurement in this repo is 2.95× (8.47s→2.87s) using 4 CPU processes on a MacBook Air
            M2 — not GPUs. The calibration constant k above is solved so this model reproduces exactly that one data
            point at n=4; every other value on the slider is this model&apos;s extrapolation, not a new measurement.
            That&apos;s deliberately more conservative than the repo&apos;s own 12-GPU projection tables, which show
            10.6× and 13.3× for the same worker count in two places that don&apos;t agree with each other — treat
            all multi-GPU numbers in that repo as unverified extrapolation, same as the amber bars here.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
