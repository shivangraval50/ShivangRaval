"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PgShell, PgPanel, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG (mulberry32) + Box-Muller normal sampler.
// Using a seeded generator (not bare Math.random) so the synthetic spread
// series — and therefore every number derived from it below — is stable
// across re-renders. Only the slider inputs change the outcome.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randNormal(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const N_POINTS = 250;
const SEED = 20260726;
const THETA = 0.06; // mean-reversion speed
const SIGMA = 0.9; // shock volatility

function generateSpreadSeries(): number[] {
  const rand = mulberry32(SEED);
  const series: number[] = [];
  let x = 0;
  for (let i = 0; i < N_POINTS; i++) {
    const shock = randNormal(rand) * SIGMA;
    x = x + THETA * (0 - x) + shock;
    series.push(x);
  }
  return series;
}

interface BacktestResult {
  sharpe: number;
  totalReturn: number;
  numTrades: number;
  equityCurve: number[];
}

const NOTIONAL = 100;

/**
 * Genuinely recomputes a rolling z-score mean-reversion backtest from the
 * synthetic spread series: rolling mean/stdev -> entry/exit signals ->
 * simulated equity curve (net of the cost-per-trade slider) -> Sharpe-like
 * ratio and total return derived from that simulation. Nothing here is a
 * looked-up number — every value is a function of (series, lookback,
 * threshold, costBps).
 */
function computeBacktest(series: number[], lookback: number, threshold: number, costBps: number): BacktestResult {
  const n = series.length;
  const z: number[] = new Array(n).fill(NaN);
  for (let i = lookback; i < n; i++) {
    const window = series.slice(i - lookback, i);
    const mean = window.reduce((a, b) => a + b, 0) / lookback;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / lookback;
    const std = Math.sqrt(variance) || 1e-9;
    z[i] = (series[i] - mean) / std;
  }

  const positions: number[] = new Array(n).fill(0);
  let pos = 0;
  for (let i = lookback; i < n; i++) {
    const zi = z[i];
    if (pos === 0) {
      if (zi > threshold) pos = -1;
      else if (zi < -threshold) pos = 1;
    } else if (pos === 1) {
      if (zi >= 0) pos = 0;
    } else if (pos === -1) {
      if (zi <= 0) pos = 0;
    }
    positions[i] = pos;
  }

  const costPerTrade = (costBps / 10000) * NOTIONAL;
  const returns: number[] = [];
  let numTrades = 0;
  let equity = NOTIONAL;
  const equityCurve: number[] = [equity];

  for (let i = lookback + 1; i < n; i++) {
    const priorPos = positions[i - 1];
    const pnl = priorPos * (series[i] - series[i - 1]);
    let cost = 0;
    if (positions[i] !== positions[i - 1]) {
      numTrades += 1;
      cost = costPerTrade;
    }
    const netPnl = pnl - cost;
    equity += netPnl;
    equityCurve.push(equity);
    returns.push(netPnl / NOTIONAL);
  }

  const meanRet = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length
    ? returns.reduce((a, b) => a + (b - meanRet) ** 2, 0) / returns.length
    : 0;
  const stdRet = Math.sqrt(variance) || 1e-9;
  const sharpe = returns.length ? (meanRet / stdRet) * Math.sqrt(252) : 0;
  const totalReturn = ((equity - NOTIONAL) / NOTIONAL) * 100;

  return { sharpe, totalReturn, numTrades, equityCurve };
}

const SPARK_W = 300;
const SPARK_H = 88;
const SPARK_PAD = 4;

function valueToY(v: number, min: number, max: number): number {
  const range = max - min || 1;
  return SPARK_H - SPARK_PAD - ((v - min) / range) * (SPARK_H - SPARK_PAD * 2);
}

function buildSparklinePoints(curve: number[], min: number, max: number): string {
  return curve
    .map((v, i) => {
      const x = curve.length > 1 ? (i / (curve.length - 1)) * (SPARK_W - SPARK_PAD * 2) + SPARK_PAD : SPARK_PAD;
      const y = valueToY(v, min, max);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

type Preset = { lookback: number; threshold: number; costBps: number };

const PRESETS: Record<"conservative" | "aggressive" | "realistic", Preset> = {
  conservative: { lookback: 40, threshold: 2.5, costBps: 1 },
  aggressive: { lookback: 15, threshold: 0.6, costBps: 2 },
  realistic: { lookback: 15, threshold: 0.5, costBps: 20 },
};

export default function StatArbPlayground() {
  const series = useMemo(() => generateSpreadSeries(), []);
  const [lookback, setLookback] = useState(20);
  const [threshold, setThreshold] = useState(1.5);
  const [costBps, setCostBps] = useState(5);

  const result = useMemo(
    () => computeBacktest(series, lookback, threshold, costBps),
    [series, lookback, threshold, costBps]
  );

  const applyPreset = (preset: Preset) => {
    setLookback(preset.lookback);
    setThreshold(preset.threshold);
    setCostBps(preset.costBps);
  };

  const sharpeTone = result.sharpe >= 0 ? "green" : "red";
  const returnTone = result.totalReturn >= 0 ? "green" : "red";
  const signature = `${lookback}-${threshold}-${costBps}`;
  const equityRising = result.equityCurve[result.equityCurve.length - 1] >= result.equityCurve[0];
  const curveMin = Math.min(...result.equityCurve);
  const curveMax = Math.max(...result.equityCurve);

  return (
    <PgShell>
      <PgPanel title="Backtest Inputs">
        <div className="space-y-5">
          <PgSlider label="Lookback window (bars)" value={lookback} min={10} max={60} step={1} onChange={setLookback} />
          <PgSlider
            label="Entry z-score threshold"
            value={threshold}
            min={0.5}
            max={3.0}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={setThreshold}
          />
          <PgSlider
            label="Cost per trade (bps)"
            value={costBps}
            min={0}
            max={20}
            step={1}
            format={(v) => `${v.toFixed(0)}bp`}
            onChange={setCostBps}
          />
          <ScenarioBar
            scenarios={[
              { label: "Conservative", onClick: () => applyPreset(PRESETS.conservative) },
              { label: "Aggressive", onClick: () => applyPreset(PRESETS.aggressive) },
              { label: "Realistic costs", onClick: () => applyPreset(PRESETS.realistic) },
            ]}
          />
        </div>
      </PgPanel>

      <PgPanel title="Simulated Performance">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatValue label="Sharpe (ann.)" value={result.sharpe.toFixed(2)} tone={sharpeTone} />
            <StatValue label="Total Return" value={`${result.totalReturn.toFixed(2)}%`} tone={returnTone} />
            <StatValue label="Num Trades" value={String(result.numTrades)} tone="cyan" />
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
              Simulated equity curve
            </div>
            <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="h-24 w-full" preserveAspectRatio="none">
              <line
                x1={SPARK_PAD}
                x2={SPARK_W - SPARK_PAD}
                y1={valueToY(NOTIONAL, curveMin, curveMax)}
                y2={valueToY(NOTIONAL, curveMin, curveMax)}
                className="stroke-line-subtle"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <motion.polyline
                key={signature}
                points={buildSparklinePoints(result.equityCurve, curveMin, curveMax)}
                fill="none"
                strokeWidth={1.75}
                className={equityRising ? "text-signal-green" : "text-signal-red"}
                stroke="currentColor"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
          </div>

          <PgNote>
            The real repo&apos;s own backtests ranged from Sharpe 10.5 down to −17.8 depending on cost assumptions
            (and one run it called &quot;exceptional&quot; hit an implausible 256) — three honestly-reported,
            mutually-inconsistent results on synthetic data. This simulation is a separate, much simpler synthetic
            series, but the sliders let you feel the same underlying lesson: tight thresholds and higher per-trade
            costs can flip a mean-reversion strategy from profitable to a real loss.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
