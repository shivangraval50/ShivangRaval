"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, ScenarioBar, StatValue, PgNote } from "./ui";

// ---- Seeded PRNG (mulberry32) so the "randomness" is stable-ish and reproducible
// per run, rather than plain Math.random(). ----
function mulberry32(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 42;

// ---- Simplified bandit / threshold-learning simulation ----
// Each "episode" draws a latent binary label y (50/50, like a coin flip — this
// stands in for "do these two entity mentions truly match"), then a noisy
// observation x = y + uniform noise (this stands in for the frozen encoder's
// cosine-similarity reward signal from the real repo, which correlates with
// truth but imperfectly). The policy's only parameter is a decision threshold
// ("policy strength"): predict 1 when x is above it. Mistakes nudge the
// threshold with a decaying step size (a real, if simplified, stochastic
// update rule) so training is a genuine random walk toward the threshold
// region that is actually optimal for this noise model — which was tuned so
// that region's ceiling lands near the repo's documented ~57.6% vs a 50%
// random baseline, rather than being tweened there directly.
const NOISE_HALF_WIDTH = 3.3;
const INITIAL_THETA = -3.3;
const BASE_LR = 0.15;
const LR_DECAY_DIV = 25;
const MAX_STORED_REWARDS = 3000;

interface TrainingState {
  theta: number;
  episodeCount: number;
  rewards: number[]; // 1 = correct, 0 = incorrect, most recent last
}

function initialTrainingState(): TrainingState {
  return { theta: INITIAL_THETA, episodeCount: 0, rewards: [] };
}

function advance(state: TrainingState, episodes: number, rng: () => number): TrainingState {
  let theta = state.theta;
  let episodeCount = state.episodeCount;
  const rewards = state.rewards.slice();

  for (let i = 0; i < episodes; i++) {
    const y = rng() < 0.5 ? 0 : 1;
    const noise = (rng() * 2 - 1) * NOISE_HALF_WIDTH;
    const x = y + noise;
    const pred = x > theta ? 1 : 0;
    const correct = pred === y;
    const lr = BASE_LR / Math.sqrt(1 + episodeCount / LR_DECAY_DIV);

    if (!correct) {
      if (y === 1 && pred === 0) theta -= lr;
      if (y === 0 && pred === 1) theta += lr;
    }

    rewards.push(correct ? 1 : 0);
    episodeCount += 1;
  }

  const trimmed = rewards.length > MAX_STORED_REWARDS ? rewards.slice(rewards.length - MAX_STORED_REWARDS) : rewards;
  return { theta, episodeCount, rewards: trimmed };
}

function meanOf(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Buckets the reward history into a fixed number of bars, each the mean
// accuracy of its slice — a genuine rolling summary of real per-episode
// outcomes, recomputed from current state every render.
function bucketAccuracy(rewards: number[], buckets: number): number[] {
  const n = rewards.length;
  if (n === 0) return [];
  const bucketCount = Math.min(buckets, n);
  const size = n / bucketCount;
  const out: number[] = [];
  for (let b = 0; b < bucketCount; b++) {
    const start = Math.floor(b * size);
    const end = b === bucketCount - 1 ? n : Math.floor((b + 1) * size);
    out.push(meanOf(rewards.slice(start, end)) * 100);
  }
  return out;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const RANDOM_BASELINE = 50;
const DOCUMENTED_CEILING = 57.6;
const BAR_COUNT = 40;
const FAST_FORWARD_EPISODES = 3000;
const TRAIN_BATCH_EPISODES = 100;
const TICK_MS = 30;

export default function AgentRLGymPlayground() {
  const stateRef = useRef<TrainingState>(initialTrainingState());
  const rngRef = useRef<() => number>(mulberry32(SEED));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  const [display, setDisplay] = useState<TrainingState>(stateRef.current);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function stopTraining() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }

  function handleTrain() {
    if (intervalRef.current) return;
    remainingRef.current = TRAIN_BATCH_EPISODES;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      stateRef.current = advance(stateRef.current, 1, rngRef.current);
      remainingRef.current -= 1;
      setDisplay(stateRef.current);
      if (remainingRef.current <= 0) stopTraining();
    }, TICK_MS);
  }

  function handleFastForward() {
    stateRef.current = advance(stateRef.current, FAST_FORWARD_EPISODES, rngRef.current);
    setDisplay(stateRef.current);
  }

  function handleReset() {
    stopTraining();
    rngRef.current = mulberry32(SEED);
    stateRef.current = initialTrainingState();
    setDisplay(stateRef.current);
  }

  const accuracyPct = display.rewards.length === 0 ? RANDOM_BASELINE : meanOf(display.rewards) * 100;
  const policyStrengthPct = clamp(((accuracyPct - RANDOM_BASELINE) / (DOCUMENTED_CEILING - RANDOM_BASELINE)) * 100, 0, 100);
  const bars = bucketAccuracy(display.rewards, BAR_COUNT);
  const aboveBaseline = accuracyPct >= RANDOM_BASELINE;

  return (
    <PgShell>
      <PgPanel title="Train the policy">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-secondary">
            Each episode is a noisy binary decision: a hidden random label vs. an observed
            signal corrupted by fixed noise. The policy learns a threshold on that signal,
            updated after every mistake — a real (simplified) stochastic update rule, computed
            tick by tick.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <PgButton onClick={handleTrain} disabled={running}>
              {running ? `Training… (${remainingRef.current} left)` : "Train 100 episodes"}
            </PgButton>
            <AnimatePresence>
              {running && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[11px] uppercase tracking-wide text-signal-cyan"
                >
                  live
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <ScenarioBar
            scenarios={[
              { label: "Reset", onClick: handleReset },
              { label: "Fast-forward", onClick: handleFastForward },
            ]}
          />

          <div className="relative h-32 rounded-lg border border-line-subtle bg-void p-2">
            <div
              className="pointer-events-none absolute left-2 right-2 border-t border-dashed border-ink-tertiary/50"
              style={{ bottom: `${RANDOM_BASELINE}%` }}
            />
            <div className="relative flex h-full items-end gap-[2px]">
              {bars.length === 0 ? (
                <span className="font-mono text-[11px] text-ink-tertiary">
                  no episodes yet — click Train to begin
                </span>
              ) : (
                bars.map((pct, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-signal-cyan transition-[height] duration-150"
                    style={{ height: `${Math.max(2, pct)}%` }}
                  />
                ))
              )}
            </div>
          </div>
          <p className="font-mono text-[11px] text-ink-tertiary">
            dashed line = 50% random baseline · bars = bucketed accuracy across training so far
          </p>

          <PgNote>
            This is a simplified in-browser illustration, not the repo&apos;s actual
            Gymnasium/PPO training loop: a single learned threshold plays a noisy
            signal-detection game, updated with a real decaying-learning-rate rule and a seeded
            PRNG. It is built so this noise model&apos;s ceiling lands near the ~57.6%-vs-50%
            pattern documented in the repo — genuinely computed each tick, not tweened to a
            hardcoded end value.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="Live metrics">
        <div className="grid grid-cols-2 gap-5">
          <StatValue label="PPO Accuracy (rolling)" value={`${accuracyPct.toFixed(1)}%`} tone={aboveBaseline ? "green" : "red"} />
          <StatValue label="Random Baseline" value={`${RANDOM_BASELINE.toFixed(1)}%`} tone="cyan" />
          <StatValue label="Episodes Trained" value={display.episodeCount.toString()} tone="cyan" />
          <StatValue label="Policy Strength" value={`${policyStrengthPct.toFixed(0)}%`} tone="amber" />
        </div>

        <div className="mt-5 border-t border-line-subtle pt-4 font-mono text-xs text-ink-tertiary">
          <div>learned threshold θ = {display.theta.toFixed(3)}</div>
          <div>episodes retained in buffer: {display.rewards.length}</div>
        </div>
      </PgPanel>
    </PgShell>
  );
}
