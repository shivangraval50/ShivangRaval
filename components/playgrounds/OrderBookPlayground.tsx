"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgInput, PgSelect, ScenarioBar, PgNote } from "./ui";

type Side = "BUY" | "SELL";

interface RestingOrder {
  id: number;
  price: number;
  qty: number;
  ts: number; // monotonic sequence number, used purely for time-priority tie-breaking
}

interface Book {
  bids: RestingOrder[]; // sorted best-first: price desc, then ts asc
  asks: RestingOrder[]; // sorted best-first: price asc, then ts asc
}

interface Trade {
  price: number;
  qty: number;
  takerSide: Side;
  takerId: number;
  makerId: number;
  ts: number;
}

interface EngineState {
  book: Book;
  trades: Trade[];
  nextId: number;
}

const EMPTY_ENGINE: EngineState = { book: { bids: [], asks: [] }, trades: [], nextId: 1 };
const MAX_TRADE_TAPE = 30;

/**
 * Real price-time-priority limit order book matching, mirroring the GTC
 * resting-order / immediate-cross semantics of the OCaml engine this demo is
 * modeled on: a BUY matches resting asks at or below its price (best price
 * first, oldest first at a tied price), sweeping multiple levels if needed;
 * any unfilled remainder rests on the book. SELL is symmetric.
 */
function matchAndRest(book: Book, side: Side, price: number, qty: number, id: number, ts: number): { book: Book; trades: Trade[] } {
  let remaining = qty;
  const trades: Trade[] = [];
  let bids = book.bids;
  let asks = book.asks;

  if (side === "BUY") {
    while (remaining > 0 && asks.length > 0 && asks[0].price <= price) {
      const maker = asks[0];
      const tradeQty = Math.min(remaining, maker.qty);
      trades.push({ price: maker.price, qty: tradeQty, takerSide: "BUY", takerId: id, makerId: maker.id, ts });
      remaining -= tradeQty;
      asks = tradeQty === maker.qty ? asks.slice(1) : [{ ...maker, qty: maker.qty - tradeQty }, ...asks.slice(1)];
    }
    if (remaining > 0) {
      bids = [...bids, { id, price, qty: remaining, ts }].sort((a, b) => b.price - a.price || a.ts - b.ts);
    }
  } else {
    while (remaining > 0 && bids.length > 0 && bids[0].price >= price) {
      const maker = bids[0];
      const tradeQty = Math.min(remaining, maker.qty);
      trades.push({ price: maker.price, qty: tradeQty, takerSide: "SELL", takerId: id, makerId: maker.id, ts });
      remaining -= tradeQty;
      bids = tradeQty === maker.qty ? bids.slice(1) : [{ ...maker, qty: maker.qty - tradeQty }, ...bids.slice(1)];
    }
    if (remaining > 0) {
      asks = [...asks, { id, price, qty: remaining, ts }].sort((a, b) => a.price - b.price || a.ts - b.ts);
    }
  }

  return { book: { bids, asks }, trades };
}

/** Pure state transition: submit one order against the current engine state. */
function applyOrder(state: EngineState, side: Side, price: number, qty: number): EngineState {
  const id = state.nextId;
  const ts = id;
  const { book, trades } = matchAndRest(state.book, side, price, qty, id, ts);
  const combinedTrades = trades.length ? [...trades.slice().reverse(), ...state.trades].slice(0, MAX_TRADE_TAPE) : state.trades;
  return { book, trades: combinedTrades, nextId: state.nextId + 1 };
}

/** Deterministic starting book used by every scenario preset: two resting
 * asks, so "cross" / "partial fill" scenarios have real liquidity to hit. */
function seedAsks(): EngineState {
  let s = applyOrder(EMPTY_ENGINE, "SELL", 101, 15);
  s = applyOrder(s, "SELL", 102, 20);
  return s;
}

export default function OrderBookPlayground() {
  const [engine, setEngine] = useState<EngineState>(EMPTY_ENGINE);
  const [side, setSide] = useState<Side>("BUY");
  const [priceStr, setPriceStr] = useState("100");
  const [qtyStr, setQtyStr] = useState("10");
  const [formError, setFormError] = useState<string | null>(null);

  function submit(s: Side, price: number, qty: number) {
    setEngine((prev) => applyOrder(prev, s, price, qty));
  }

  function handleSubmit() {
    const priceNum = Number(priceStr);
    const qtyNum = Number(qtyStr);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFormError("Price must be a positive number.");
      return;
    }
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setFormError("Quantity must be a positive number.");
      return;
    }
    setFormError(null);
    submit(side, priceNum, Math.round(qtyNum));
  }

  function scenarioAddLiquidity() {
    setFormError(null);
    setEngine(() => applyOrder(seedAsks(), "BUY", 99, 12));
  }
  function scenarioCrossSpread() {
    setFormError(null);
    setEngine(() => {
      let s = applyOrder(seedAsks(), "BUY", 99, 12);
      s = applyOrder(s, "BUY", 101, 10);
      return s;
    });
  }
  function scenarioPartialFill() {
    setFormError(null);
    setEngine(() => {
      let s = applyOrder(seedAsks(), "BUY", 99, 12);
      s = applyOrder(s, "BUY", 101, 25);
      return s;
    });
  }
  function resetBook() {
    setFormError(null);
    setEngine(EMPTY_ENGINE);
  }

  const { bids, asks } = engine.book;

  return (
    <PgShell>
      <PgPanel title="Submit Order">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <PgSelect
              value={side}
              onChange={(v) => setSide(v === "SELL" ? "SELL" : "BUY")}
              options={[
                { value: "BUY", label: "BUY" },
                { value: "SELL", label: "SELL" },
              ]}
            />
            <PgInput
              type="number"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              placeholder="Price"
              aria-label="Price"
            />
            <PgInput
              type="number"
              value={qtyStr}
              onChange={(e) => setQtyStr(e.target.value)}
              placeholder="Qty"
              aria-label="Quantity"
            />
          </div>
          {formError && <p className="font-mono text-xs text-signal-red">{formError}</p>}
          <PgButton onClick={handleSubmit} className="w-full">
            Submit LIMIT order
          </PgButton>

          <ScenarioBar
            scenarios={[
              { label: "Add resting liquidity", onClick: scenarioAddLiquidity },
              { label: "Cross the spread", onClick: scenarioCrossSpread },
              { label: "Partial fill", onClick: scenarioPartialFill },
            ]}
          />
          <button
            onClick={resetBook}
            className="font-mono text-[11px] text-ink-tertiary underline decoration-dotted underline-offset-2 hover:text-ink-secondary"
          >
            clear book
          </button>

          <PgNote>
            No throughput number is published for the real OCaml engine yet — what&apos;s shown here is genuine
            price-time-priority matching behavior (GTC resting orders, best-price-then-oldest-first fills, partial
            fills resting their remainder), reimplemented in TypeScript rather than calling the real OCaml binary.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="Live Order Book">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
                <span>Bids</span>
                <span>Px · Qty · ID</span>
              </div>
              <div className="space-y-0.5">
                {bids.length === 0 && <div className="font-mono text-xs text-ink-tertiary">— empty —</div>}
                <AnimatePresence initial={false}>
                  {bids.slice(0, 8).map((o, i) => (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex justify-between rounded px-2 py-1 font-mono text-xs ${
                        i === 0 ? "bg-signal-green/10 text-signal-green" : "text-ink-secondary"
                      }`}
                    >
                      <span>{o.price.toFixed(2)}</span>
                      <span>{o.qty}</span>
                      <span className="text-ink-tertiary">#{o.id}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
                <span>Asks</span>
                <span>Px · Qty · ID</span>
              </div>
              <div className="space-y-0.5">
                {asks.length === 0 && <div className="font-mono text-xs text-ink-tertiary">— empty —</div>}
                <AnimatePresence initial={false}>
                  {asks.slice(0, 8).map((o, i) => (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex justify-between rounded px-2 py-1 font-mono text-xs ${
                        i === 0 ? "bg-signal-red/10 text-signal-red" : "text-ink-secondary"
                      }`}
                    >
                      <span>{o.price.toFixed(2)}</span>
                      <span>{o.qty}</span>
                      <span className="text-ink-tertiary">#{o.id}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">Trade Tape</div>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {engine.trades.length === 0 && <div className="font-mono text-xs text-ink-tertiary">no trades yet</div>}
              <AnimatePresence initial={false}>
                {engine.trades.slice(0, 15).map((t) => (
                  <motion.div
                    key={`trade-${t.ts}-${t.makerId}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between font-mono text-xs"
                  >
                    <span className="text-signal-amber">
                      {t.qty} @ {t.price.toFixed(2)}
                    </span>
                    <span className="text-ink-tertiary">
                      taker #{t.takerId} ({t.takerSide}) ↔ maker #{t.makerId}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </PgPanel>
    </PgShell>
  );
}
