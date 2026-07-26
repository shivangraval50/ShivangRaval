"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

type Side = "BUY" | "SELL";

interface RestingOrder {
  id: number;
  price: number;
  qty: number;
}

interface VenueBook {
  bids: RestingOrder[];
  asks: RestingOrder[];
}

const MAX_BOOK_DEPTH = 40;

function insertSorted(arr: RestingOrder[], order: RestingOrder, descending: boolean): RestingOrder[] {
  const next = [...arr, order];
  next.sort((a, b) => (descending ? b.price - a.price : a.price - b.price) || a.id - b.id);
  return next.length > MAX_BOOK_DEPTH ? next.slice(0, MAX_BOOK_DEPTH) : next;
}

/**
 * Real price-time-priority matching against one venue's resting book.
 * Returns the updated book plus how many individual fills occurred — both
 * genuinely computed from (book, side, price, qty), not simulated after the
 * fact.
 */
function matchOrder(book: VenueBook, side: Side, price: number, qty: number, id: number): { book: VenueBook; tradeCount: number } {
  let remaining = qty;
  let tradeCount = 0;
  let bids = book.bids;
  let asks = book.asks;

  if (side === "BUY") {
    while (remaining > 0 && asks.length > 0 && asks[0].price <= price) {
      const maker = asks[0];
      const tradeQty = Math.min(remaining, maker.qty);
      tradeCount += 1;
      remaining -= tradeQty;
      asks = tradeQty === maker.qty ? asks.slice(1) : [{ ...maker, qty: maker.qty - tradeQty }, ...asks.slice(1)];
    }
    if (remaining > 0) bids = insertSorted(bids, { id, price, qty: remaining }, true);
  } else {
    while (remaining > 0 && bids.length > 0 && bids[0].price >= price) {
      const maker = bids[0];
      const tradeQty = Math.min(remaining, maker.qty);
      tradeCount += 1;
      remaining -= tradeQty;
      bids = tradeQty === maker.qty ? bids.slice(1) : [{ ...maker, qty: maker.qty - tradeQty }, ...bids.slice(1)];
    }
    if (remaining > 0) asks = insertSorted(asks, { id, price, qty: remaining }, false);
  }

  return { book: { bids, asks }, tradeCount };
}

const RUN_DURATION_MS = 3000;
const MIN_VENUES = 1;
const MAX_VENUES = 8;
const MIN_RATE = 20;
const MAX_RATE = 2000;

interface Stats {
  eventsPerSec: number;
  tradesMatched: number;
  venuesActive: number;
}

interface SimEngine {
  venues: VenueBook[];
  startTime: number;
  lastFrameTime: number;
  totalEvents: number;
  totalTrades: number;
  nextId: number;
  rate: number;
}

export default function MarketSimulatorPlayground() {
  const [numVenues, setNumVenues] = useState(4);
  const [arrivalRate, setArrivalRate] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats>({ eventsPerSec: 0, tradesMatched: 0, venuesActive: 4 });

  const rafRef = useRef<number | null>(null);
  const engineRef = useRef<SimEngine | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function startSimulation(overrideVenues?: number, overrideRate?: number) {
    if (isRunning) return;
    const venuesCount = overrideVenues ?? numVenues;
    const rate = overrideRate ?? arrivalRate;
    if (overrideVenues !== undefined) setNumVenues(overrideVenues);
    if (overrideRate !== undefined) setArrivalRate(overrideRate);

    const now = performance.now();
    engineRef.current = {
      venues: Array.from({ length: venuesCount }, () => ({ bids: [], asks: [] })),
      startTime: now,
      lastFrameTime: now,
      totalEvents: 0,
      totalTrades: 0,
      nextId: 1,
      rate,
    };
    setIsRunning(true);
    setStats({ eventsPerSec: 0, tradesMatched: 0, venuesActive: venuesCount });

    const tick = (t: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const elapsedSinceStart = t - engine.startTime;

      if (elapsedSinceStart >= RUN_DURATION_MS) {
        const finalElapsedSec = elapsedSinceStart / 1000;
        setStats({
          eventsPerSec: engine.totalEvents / finalElapsedSec,
          tradesMatched: engine.totalTrades,
          venuesActive: engine.venues.length,
        });
        setIsRunning(false);
        engineRef.current = null;
        return;
      }

      // Expected arrivals this frame, from real elapsed frame time (dt) —
      // a small stochastic-rounding step so low target rates still average
      // out correctly instead of being floored to 0 every frame.
      const dt = (t - engine.lastFrameTime) / 1000;
      engine.lastFrameTime = t;
      const expected = engine.rate * dt;
      let n = Math.floor(expected);
      if (Math.random() < expected - n) n += 1;

      for (let i = 0; i < n; i++) {
        const venueIdx = Math.floor(Math.random() * engine.venues.length);
        const side: Side = Math.random() < 0.5 ? "BUY" : "SELL";
        const price = 100 + Math.round((Math.random() - 0.5) * 10);
        const qty = 1 + Math.floor(Math.random() * 20);
        const id = engine.nextId++;
        const { book, tradeCount } = matchOrder(engine.venues[venueIdx], side, price, qty, id);
        engine.venues[venueIdx] = book;
        engine.totalTrades += tradeCount;
        engine.totalEvents += 1;
      }

      const actualElapsedSec = (performance.now() - engine.startTime) / 1000;
      setStats({
        eventsPerSec: actualElapsedSec > 0 ? engine.totalEvents / actualElapsedSec : 0,
        tradesMatched: engine.totalTrades,
        venuesActive: engine.venues.length,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <PgShell>
      <PgPanel title="Simulator Controls">
        <div className="space-y-5">
          <PgSlider
            label="Venues"
            value={numVenues}
            min={MIN_VENUES}
            max={MAX_VENUES}
            step={1}
            onChange={(v) => {
              if (!isRunning) setNumVenues(v);
            }}
          />
          <PgSlider
            label="Order arrival rate (target evt/s)"
            value={arrivalRate}
            min={MIN_RATE}
            max={MAX_RATE}
            step={20}
            onChange={(v) => {
              if (!isRunning) setArrivalRate(v);
            }}
          />
          <PgButton onClick={() => startSimulation()} disabled={isRunning} className="w-full">
            {isRunning ? "Running…" : "Run 3s simulation"}
          </PgButton>
          <ScenarioBar
            scenarios={[
              { label: "1 venue", onClick: () => startSimulation(1) },
              { label: "8 venues", onClick: () => startSimulation(8) },
              { label: "High-frequency burst", onClick: () => startSimulation(undefined, MAX_RATE) },
            ]}
          />
        </div>
      </PgPanel>

      <PgPanel title="Live Measurement">
        <div className="space-y-4">
          <motion.div
            key={isRunning ? "running" : "idle"}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-3"
          >
            <StatValue label="Events/Sec (measured)" value={stats.eventsPerSec.toFixed(0)} tone="cyan" />
            <StatValue label="Trades Matched" value={stats.tradesMatched.toLocaleString()} tone="green" />
            <StatValue label="Venues Active" value={String(stats.venuesActive)} tone="amber" />
          </motion.div>

          <PgNote>
            Events/Sec is measured live via performance.now() — it&apos;s however many synthetic orders this browser
            tab actually generated and ran through real per-venue price-time-priority matching in the last 3 seconds,
            not a stand-in number. The real repo shows the same shape of result at much larger scale: 5.68M evt/s
            for scheduling alone, dropping to 149K evt/s once real 8-venue matching is included — matching is the
            expensive part there too, and all of that data is synthetic as well.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
