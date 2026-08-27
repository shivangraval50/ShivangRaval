"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgSlider, PgToggle, ScenarioBar, StatValue, PgNote } from "./ui";

// The repo's own measured single-instance, single-partition throughput —
// the one real number in this story. Everything below is derived from it.
const BASE_EVENTS_PER_SEC = 66_700;
// The topic's real partition ceiling in this simulation: Kafka never lets
// two consumers in one group read the same partition concurrently, so
// parallelism can never exceed the partition count no matter how many
// consumer instances join.
const TOTAL_PARTITIONS = 4;
const TICKS = 24;

interface SimResult {
  instances: number;
  properPartitioning: boolean;
  activePartitions: number;
  perConsumer: number[];
  combined: number;
}

// A small real tick-by-tick simulation (not a single formula): each tick,
// every currently-active partition emits its share of events with a little
// jitter, and whichever consumer owns that partition banks them. Consumers
// that own no partition bank nothing, tick after tick — modeling the real
// Kafka constraint that idle consumers beyond the partition count do no work.
function simulate(instances: number, properPartitioning: boolean, seed: number): SimResult {
  const activePartitions = properPartitioning ? Math.min(instances, TOTAL_PARTITIONS) : 1;
  const perConsumerTotals = new Array(instances).fill(0) as number[];

  // seed only perturbs the jitter stream so "re-simulate" produces a fresh
  // (but still honestly-computed) run rather than a frozen one.
  let rngState = seed + 1;
  function jitter(): number {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    const rand = rngState / 0x7fffffff;
    return 0.9 + rand * 0.2;
  }

  for (let t = 0; t < TICKS; t++) {
    for (let p = 0; p < activePartitions; p++) {
      const owner = p % instances;
      perConsumerTotals[owner] += BASE_EVENTS_PER_SEC * jitter();
    }
  }

  const perConsumer = perConsumerTotals.map((total) => total / TICKS);
  const combined = perConsumer.reduce((a, b) => a + b, 0);

  return { instances, properPartitioning, activePartitions, perConsumer, combined };
}

export default function StreamingPipelinePlayground() {
  const [instances, setInstances] = useState(5);
  const [properPartitioning, setProperPartitioning] = useState(false);
  const [seed, setSeed] = useState(0);

  const sim = useMemo(
    () => simulate(instances, properPartitioning, seed),
    [instances, properPartitioning, seed],
  );

  const idleCount = sim.perConsumer.filter((v) => v < BASE_EVENTS_PER_SEC * 0.05).length;
  const scaled = sim.activePartitions > 1;

  function runScenario(nextInstances: number, nextPartitioning: boolean) {
    setInstances(nextInstances);
    setProperPartitioning(nextPartitioning);
    setSeed((c) => c + 1);
  }

  return (
    <PgShell>
      <PgPanel title="Consumer group configuration">
        <div className="space-y-4">
          <PgSlider
            label="Consumer instances"
            value={instances}
            min={1}
            max={5}
            step={1}
            onChange={setInstances}
            format={(v) => `${v} instance${v === 1 ? "" : "s"}`}
          />
          <PgToggle label="Proper partitioning" checked={properPartitioning} onChange={setProperPartitioning} />

          <ScenarioBar
            scenarios={[
              { label: "1 partition (repo's actual result)", onClick: () => runScenario(5, false) },
              { label: "4 partitions (proper scaling)", onClick: () => runScenario(4, true) },
            ]}
          />

          <PgButton variant="secondary" onClick={() => setSeed((c) => c + 1)}>
            Re-run tick simulation ▸
          </PgButton>

          <p className="font-mono text-[0.6471rem] text-ink-tertiary">
            Topic has {TOTAL_PARTITIONS} partitions total. A message can only be consumed by whichever single
            instance owns its partition — adding more instances than active partitions leaves the extras idle.
          </p>
        </div>
      </PgPanel>

      <PgPanel title="Result">
        <div className="flex min-h-[220px] flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${instances}-${properPartitioning}-${seed}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatValue
                  label="Combined throughput"
                  value={`${Math.round(sim.combined).toLocaleString()} evt/s`}
                  tone={scaled ? "green" : "amber"}
                />
                <StatValue
                  label="Active partitions"
                  value={`${sim.activePartitions} of ${TOTAL_PARTITIONS}`}
                  tone="cyan"
                />
                <StatValue
                  label="Idle instances"
                  value={`${idleCount}`}
                  tone={idleCount > 0 ? "red" : "green"}
                />
              </div>

              <div className="space-y-2 border-t border-line-subtle pt-3">
                <div className="font-mono text-[0.6471rem] uppercase tracking-wide text-ink-tertiary">
                  Per-consumer load
                </div>
                {sim.perConsumer.map((load, i) => {
                  const pct = Math.min(100, (load / BASE_EVENTS_PER_SEC) * 100);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 font-mono text-[0.6471rem] text-ink-tertiary">consumer-{i}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-void">
                        <motion.div
                          className={`h-full rounded-full ${pct > 5 ? "bg-signal-cyan" : "bg-line-strong"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-mono text-[0.6471rem] text-ink-secondary">
                        {Math.round(load).toLocaleString()}/s
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <PgNote>
            This is a small tick-by-tick simulation of Kafka&apos;s partition/consumer-group mechanics, not a live
            cluster. It mirrors a real finding from this repo: with partitioning off, all instances funnel through
            one active partition, so combined throughput stays flat as instances increase — the actual repo&apos;s
            5-instance load test measured 66,667 events/sec combined, the same as a single instance, because scaling
            was never realized in that run. The oft-quoted &quot;333,333 events/sec&quot; (5× that) is a capacity
            projection, not a measured result. Toggle partitioning on to see throughput genuinely scale with
            min(instances, {TOTAL_PARTITIONS}) instead.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
