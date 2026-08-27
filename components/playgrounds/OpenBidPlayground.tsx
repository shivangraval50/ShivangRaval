"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgInput, PgSlider, ScenarioBar, PgNote, StatValue } from "./ui";
import { DUR, EASE } from "@/lib/motion";

/* ===========================================================================
 * PORTED RULES — a copy of openbid's real logic, not a reimplementation.
 *
 * Everything between here and the SIMULATION banner below is a faithful,
 * hand-copied port of openbid's pure packages, so every outcome this
 * playground shows is decided by the project's own rules rather than by a
 * script that already knows the answer:
 *
 *   AuctionState / AuctionEvent / RejectReason
 *      https://github.com/shivangraval50/openbid/blob/main/packages/auction-core/src/types.ts
 *   minimumBid, validateBid            (decide)
 *      https://github.com/shivangraval50/openbid/blob/main/packages/auction-core/src/validate.ts
 *   initialState, reduce               (apply)
 *      https://github.com/shivangraval50/openbid/blob/main/packages/auction-core/src/reduce.ts
 *   closeAuction
 *      https://github.com/shivangraval50/openbid/blob/main/packages/auction-core/src/close.ts
 *   newBucket, takeToken               (per-connection rate limit)
 *      https://github.com/shivangraval50/openbid/blob/main/packages/room-do/src/ratelimit.ts
 *   selectDisplayPrice                 (optimistic display selector)
 *      https://github.com/shivangraval50/openbid/blob/main/packages/store/src/index.ts
 *   REJECT_COPY                        (the user-facing reason strings)
 *      https://github.com/shivangraval50/openbid/blob/main/apps/web/src/components/BidForm.tsx
 *
 * This is a copy, not an import — the portfolio takes no dependency on
 * openbid — so if the upstream rules change, this block has to be updated by
 * hand. `packages/auction-core` is portable at all only because it is pure:
 * zero I/O, zero platform imports, zero clock reads.
 * =========================================================================== */

type RejectReason = "TOO_LOW" | "AUCTION_CLOSED" | "RATE_LIMITED" | "INSUFFICIENT_BUDGET";

interface AuctionConfig {
  itemName: string;
  startingPrice: number;
  minIncrement: number;
  startingBudget: number;
  antiSnipeWindowMs: number;
  antiSnipeExtensionMs: number;
  endsAtMs: number;
}

interface Participant {
  id: string;
  nickname: string;
  budget: number;
}

interface Bid {
  participantId: string;
  amount: number;
  atMs: number;
}

interface AuctionState {
  config: AuctionConfig;
  status: "open" | "closed";
  endsAtMs: number;
  highBid: Bid | null;
  participants: Record<string, Participant>;
  winner: { participantId: string; amount: number } | null;
}

type AuctionEvent =
  | { type: "joined"; participantId: string; nickname: string; atMs: number }
  | {
      type: "bidPlaced";
      participantId: string;
      amount: number;
      atMs: number;
      newEndsAtMs: number;
    }
  | {
      type: "closed";
      atMs: number;
      winner: { participantId: string; amount: number } | null;
    };

interface BidCommand {
  participantId: string;
  amount: number;
  atMs: number;
}

type BidDecision = { ok: true; event: AuctionEvent } | { ok: false; reason: RejectReason };

function minimumBid(state: AuctionState): number {
  return state.highBid === null
    ? state.config.startingPrice
    : state.highBid.amount + state.config.minIncrement;
}

/** decide: current state + a command -> a rejection, or an event. Never mutates. */
function validateBid(state: AuctionState, cmd: BidCommand): BidDecision {
  const participant = state.participants[cmd.participantId];
  if (state.status === "closed" || cmd.atMs >= state.endsAtMs || participant === undefined) {
    return { ok: false, reason: "AUCTION_CLOSED" };
  }
  if (cmd.amount < minimumBid(state)) {
    return { ok: false, reason: "TOO_LOW" };
  }
  if (cmd.amount > participant.budget) {
    return { ok: false, reason: "INSUFFICIENT_BUDGET" };
  }

  const insideAntiSnipeWindow = state.endsAtMs - cmd.atMs <= state.config.antiSnipeWindowMs;
  const newEndsAtMs = insideAntiSnipeWindow
    ? cmd.atMs + state.config.antiSnipeExtensionMs
    : state.endsAtMs;

  return {
    ok: true,
    event: {
      type: "bidPlaced",
      participantId: cmd.participantId,
      amount: cmd.amount,
      atMs: cmd.atMs,
      newEndsAtMs,
    },
  };
}

function initialState(config: AuctionConfig): AuctionState {
  return {
    config,
    status: "open",
    endsAtMs: config.endsAtMs,
    highBid: null,
    participants: {},
    winner: null,
  };
}

/** apply: current state + an event -> next state. Trusts, and never rejects. */
function reduce(state: AuctionState, event: AuctionEvent): AuctionState {
  switch (event.type) {
    case "joined": {
      if (state.participants[event.participantId] !== undefined) return state;
      return {
        ...state,
        participants: {
          ...state.participants,
          [event.participantId]: {
            id: event.participantId,
            nickname: event.nickname,
            budget: state.config.startingBudget,
          },
        },
      };
    }
    case "bidPlaced": {
      return {
        ...state,
        endsAtMs: event.newEndsAtMs,
        highBid: {
          participantId: event.participantId,
          amount: event.amount,
          atMs: event.atMs,
        },
      };
    }
    case "closed": {
      return { ...state, status: "closed", winner: event.winner };
    }
  }
}

function closeAuction(state: AuctionState, atMs: number): AuctionEvent | null {
  if (state.status === "closed") return null;
  return {
    type: "closed",
    atMs,
    winner:
      state.highBid === null
        ? null
        : { participantId: state.highBid.participantId, amount: state.highBid.amount },
  };
}

const CAPACITY = 10;
const WINDOW_MS = 10_000;

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

function newBucket(nowMs: number): Bucket {
  return { tokens: CAPACITY, lastRefillMs: nowMs };
}

function takeToken(bucket: Bucket, nowMs: number): { allowed: boolean; bucket: Bucket } {
  const elapsedMs = Math.max(0, nowMs - bucket.lastRefillMs);
  const refilled = Math.min(CAPACITY, bucket.tokens + (elapsedMs / WINDOW_MS) * CAPACITY);

  if (refilled < 1) {
    return { allowed: false, bucket: { tokens: refilled, lastRefillMs: nowMs } };
  }
  return { allowed: true, bucket: { tokens: refilled - 1, lastRefillMs: nowMs } };
}

const REJECT_COPY: Record<RejectReason, string> = {
  TOO_LOW: "You were outbid — the price moved while you were typing.",
  AUCTION_CLOSED: "This auction is closed.",
  RATE_LIMITED: "Slow down — you're bidding too fast.",
  INSUFFICIENT_BUDGET: "That's over your remaining budget.",
};

/* ===========================================================================
 * SIMULATION — this playground's own code. NOT part of openbid.
 *
 * The ported rules above are the whole decision surface; they need three
 * things a browser tab on its own doesn't have, and those three things are
 * what this section fakes:
 *
 *   1. A network. `latencyMs` (slider) plus a small per-message jitter, so
 *      two "simultaneous" bids genuinely arrive in an order nobody chose.
 *   2. The Durable Object's single-threaded delivery. `step` drains the DO's
 *      inbox one message at a time, and the decide-then-commit sequence for
 *      each one (takeToken -> validateBid -> append -> reduce -> broadcast)
 *      has no yield point in it — which is exactly the property the real
 *      RoomDO relies on for bid ordering.
 *   3. A clock and an alarm. The real deadline is enforced by a DO alarm, not
 *      a client timer; `step` checks it on every tick.
 *
 * Nothing here decides who wins a race. `validateBid` does, from whatever
 * order the jitter produced.
 * =========================================================================== */

type BidderId = "you" | "rival";

const BIDDERS: { id: BidderId; label: string }[] = [
  { id: "you", label: "You" },
  { id: "rival", label: "Rival" },
];

function labelOf(id: string): string {
  return id === "you" ? "You" : "Rival";
}

/** openbid's own room defaults, verbatim from apps/web/src/actions/rooms.ts.
 *  `startingBudget` is a cap on any single bid — the real `reduce` never
 *  decrements it — so it is labelled "budget cap" below rather than as spend. */
const ROOM_DEFAULTS = {
  startingPrice: 100,
  minIncrement: 10,
  startingBudget: 1_000,
  antiSnipeWindowMs: 10_000,
  antiSnipeExtensionMs: 15_000,
} as const;

const DURATION_MS = 180_000;
/**
 * Independent arrival jitter, applied per *connection*: two separate bidders
 * get two independent draws (so the race has no predetermined winner), while a
 * burst down one socket is sent with `jitterMs = 0` because a single socket
 * preserves order. This jitter, not a script, is what picks a race's winner.
 */
const JITTER_MS = 140;

interface ToServer {
  id: number;
  from: BidderId;
  clientSeq: number;
  amount: number;
  arriveAt: number;
}

type ToClient =
  | { id: number; kind: "delta"; to: BidderId; seq: number; event: AuctionEvent; arriveAt: number }
  | { id: number; kind: "ack"; to: BidderId; clientSeq: number; seq: number; arriveAt: number }
  | {
      id: number;
      kind: "reject";
      to: BidderId;
      clientSeq: number;
      amount: number;
      reason: RejectReason;
      arriveAt: number;
    };

type Status = "idle" | "provisional" | "confirmed" | "rejected";

/** One browser tab's view: its own reduced copy of server state plus the
 *  optimistic layer that may still be wrong. */
interface ClientView {
  server: AuctionState;
  lastSeenSeq: number;
  pending: { clientSeq: number; amount: number }[];
  status: Status;
  rejectReason: RejectReason | null;
}

interface FeedItem {
  id: number;
  tone: "accept" | "reject" | "wire" | "clock";
  text: string;
}

interface Sim {
  /** The Durable Object: the only authority. */
  server: AuctionState;
  /** The append-only event log. `serverSeq` is its 1-based position, exactly
   *  as SQLite's AUTOINCREMENT assigns it upstream, so the next seq is always
   *  `log.length + 1` and cannot drift from a separate counter. Replay is a
   *  fold over this array and nothing else. */
  log: { seq: number; event: AuctionEvent }[];
  buckets: Record<BidderId, Bucket>;
  toServer: ToServer[];
  toClient: ToClient[];
  clients: Record<BidderId, ClientView>;
  nextClientSeq: number;
  nextMsgId: number;
  feed: FeedItem[];
  nextFeedId: number;
  extendedAt: number | null;
}

const FEED_MAX = 12;

function pushFeed(s: Sim, tone: FeedItem["tone"], text: string): Sim {
  return {
    ...s,
    feed: [{ id: s.nextFeedId, tone, text }, ...s.feed].slice(0, FEED_MAX),
    nextFeedId: s.nextFeedId + 1,
  };
}

function freshRoom(now: number): Sim {
  const config: AuctionConfig = {
    itemName: "A rare optimising compiler",
    ...ROOM_DEFAULTS,
    endsAtMs: now + DURATION_MS,
  };
  // Both bidders join through real `joined` events, folded by the real
  // `reduce` — so the participant table and the event log are both genuine.
  let server = initialState(config);
  const log: { seq: number; event: AuctionEvent }[] = [];
  let seq = 1;
  for (const b of BIDDERS) {
    const event: AuctionEvent = {
      type: "joined",
      participantId: b.id,
      nickname: b.label,
      atMs: now,
    };
    server = reduce(server, event);
    log.push({ seq, event });
    seq += 1;
  }

  const view = (): ClientView => ({
    server,
    lastSeenSeq: seq - 1,
    pending: [],
    status: "idle",
    rejectReason: null,
  });

  return {
    server,
    log,
    buckets: { you: newBucket(now), rival: newBucket(now) },
    toServer: [],
    toClient: [],
    clients: { you: view(), rival: view() },
    nextClientSeq: 1,
    nextMsgId: 1,
    feed: [],
    nextFeedId: 1,
    extendedAt: null,
  };
}

/** Scenario setup only: re-arm the room's deadline (authority and both client
 *  copies together, so nobody is looking at a stale clock). Not a rule — this
 *  stands in for "you arrived at a room that is nearly over". */
function withDeadline(s: Sim, endsAtMs: number): Sim {
  return {
    ...s,
    server: { ...s.server, endsAtMs },
    clients: {
      you: { ...s.clients.you, server: { ...s.clients.you.server, endsAtMs } },
      rival: { ...s.clients.rival, server: { ...s.clients.rival.server, endsAtMs } },
    },
  };
}

/** One draw of connection jitter. Called by the click handler, never inside a
 *  `setSim` updater — React double-invokes updaters under Strict Mode, and a
 *  state updater that reads a random source is not a pure function of its
 *  input. `enqueueBid` therefore takes an already-resolved offset. */
function drawJitter(): number {
  return Math.random() * JITTER_MS;
}

/** Client-side optimism: the bid shows immediately and the socket send is
 *  queued behind the simulated wire. */
function enqueueBid(
  s: Sim,
  from: BidderId,
  amount: number,
  now: number,
  latencyMs: number,
  extraDelay = 0,
  jitter = 0
): Sim {
  const clientSeq = s.nextClientSeq;
  const client = s.clients[from];
  const next: Sim = {
    ...s,
    nextClientSeq: clientSeq + 1,
    nextMsgId: s.nextMsgId + 1,
    clients: {
      ...s.clients,
      [from]: {
        ...client,
        pending: [...client.pending, { clientSeq, amount }],
        status: "provisional",
        rejectReason: null,
      },
    },
    toServer: [
      ...s.toServer,
      {
        id: s.nextMsgId,
        from,
        clientSeq,
        amount,
        arriveAt: now + latencyMs + extraDelay + jitter,
      },
    ],
  };
  return pushFeed(next, "wire", `${labelOf(from)} sent ${amount} · provisional`);
}

/** `Omit` over a union collapses to the union's shared keys, which would drop
 *  every message-specific field; distribute it instead. */
type Unsent<T> = T extends unknown ? Omit<T, "id"> : never;

function sendToClients(s: Sim, msgs: Unsent<ToClient>[]): Sim {
  let id = s.nextMsgId;
  const stamped: ToClient[] = msgs.map((m) => ({ ...m, id: id++ }) as ToClient);
  return { ...s, nextMsgId: id, toClient: [...s.toClient, ...stamped] };
}

/**
 * One `bid` message, handled the way `RoomDO.webSocketMessage` handles it:
 * take a rate-limit token, decide with `validateBid`, append the event (which
 * assigns the authoritative serverSeq), fold it with `reduce`, broadcast the
 * delta to *every* socket, and only then ack the sender. No `await` anywhere
 * in that sequence — which is the entire ordering guarantee.
 */
function serverHandleBid(s: Sim, m: ToServer, now: number, latencyMs: number): Sim {
  const limit = takeToken(s.buckets[m.from], now);
  let next: Sim = { ...s, buckets: { ...s.buckets, [m.from]: limit.bucket } };

  if (!limit.allowed) {
    next = pushFeed(next, "reject", `DO rejected ${labelOf(m.from)} ${m.amount} · RATE_LIMITED`);
    return sendToClients(next, [
      {
        kind: "reject",
        to: m.from,
        clientSeq: m.clientSeq,
        amount: m.amount,
        reason: "RATE_LIMITED",
        arriveAt: now + latencyMs,
      },
    ]);
  }

  const decision = validateBid(next.server, {
    participantId: m.from,
    amount: m.amount,
    atMs: now,
  });

  if (!decision.ok) {
    next = pushFeed(
      next,
      "reject",
      `DO rejected ${labelOf(m.from)} ${m.amount} · ${decision.reason}`
    );
    return sendToClients(next, [
      {
        kind: "reject",
        to: m.from,
        clientSeq: m.clientSeq,
        amount: m.amount,
        reason: decision.reason,
        arriveAt: now + latencyMs,
      },
    ]);
  }

  const seq = next.log.length + 1;
  const previousEndsAt = next.server.endsAtMs;
  const server = reduce(next.server, decision.event);
  next = {
    ...next,
    server,
    log: [...next.log, { seq, event: decision.event }],
  };
  next = pushFeed(next, "accept", `DO #${seq} accepted ${labelOf(m.from)} ${m.amount}`);

  if (server.endsAtMs !== previousEndsAt) {
    next = { ...next, extendedAt: now };
    // Say what the rule did, not just how far the clock jumped: the rule is
    // "deadline := this bid + 15s", so the *shift* is whatever that works out
    // to from wherever the deadline happened to be. Reporting only the shift
    // read as a contradiction against the fixed "+15s" the rule advertises.
    next = pushFeed(
      next,
      "clock",
      `Deadline → this bid + ${ROOM_DEFAULTS.antiSnipeExtensionMs / 1000}s (moved +${Math.round(
        (server.endsAtMs - previousEndsAt) / 1000
      )}s) · landed inside the ${ROOM_DEFAULTS.antiSnipeWindowMs / 1000}s anti-snipe window`
    );
  }

  return sendToClients(next, [
    // Broadcast first, to everyone including the bidder…
    ...BIDDERS.map((b) => ({
      kind: "delta" as const,
      to: b.id,
      seq,
      event: decision.event,
      arriveAt: now + latencyMs,
    })),
    // …then ack. Same arrival time, but a later message id, and `step`
    // breaks arrival ties by id — so a socket delivers in send order, the
    // way a real one does. (Giving the ack a later `arriveAt` instead was a
    // real bug: a whole batch of bids handled in one tick shares one `now`,
    // so a +1ms ack sorted *after* the rejects issued later in that same
    // batch, and the ack's "confirmed" then overwrote a rejection the
    // bidder should have seen.) The order still matters for the reason it
    // matters upstream: the authoritative price lands before the optimistic
    // one is cleared, so a winning bid never appears to vanish for a frame.
    {
      kind: "ack" as const,
      to: m.from,
      clientSeq: m.clientSeq,
      seq,
      arriveAt: now + latencyMs,
    },
  ]);
}

/** The DO alarm — the server-owned clock, not a client timer. */
function serverAlarm(s: Sim, now: number, latencyMs: number): Sim {
  const event = closeAuction(s.server, now);
  if (event === null) return s;
  const seq = s.log.length + 1;
  let next: Sim = {
    ...s,
    server: reduce(s.server, event),
    log: [...s.log, { seq, event }],
  };
  const winner = event.type === "closed" ? event.winner : null;
  next = pushFeed(
    next,
    "clock",
    winner === null
      ? `DO #${seq} closed — no bids`
      : `DO #${seq} closed — ${labelOf(winner.participantId)} wins at ${winner.amount}`
  );
  return sendToClients(
    next,
    BIDDERS.map((b) => ({
      kind: "delta" as const,
      to: b.id,
      seq,
      event,
      arriveAt: now + latencyMs,
    }))
  );
}

function clientApply(s: Sim, m: ToClient): Sim {
  const client = s.clients[m.to];
  let updated: ClientView;

  switch (m.kind) {
    case "delta": {
      // A delta at or below what's already applied is a duplicate.
      if (m.seq <= client.lastSeenSeq) return s;
      updated = { ...client, server: reduce(client.server, m.event), lastSeenSeq: m.seq };
      break;
    }
    case "ack": {
      // `lastSeenSeq` deliberately does NOT advance here — an ack is not
      // evidence the event was applied.
      updated = {
        ...client,
        pending: client.pending.filter((p) => p.clientSeq !== m.clientSeq),
        status: "confirmed",
        rejectReason: null,
      };
      break;
    }
    case "reject": {
      // Drop only that clientSeq, so sibling optimistic bids survive.
      updated = {
        ...client,
        pending: client.pending.filter((p) => p.clientSeq !== m.clientSeq),
        status: "rejected",
        rejectReason: m.reason,
      };
      break;
    }
  }

  let next: Sim = { ...s, clients: { ...s.clients, [m.to]: updated } };
  if (m.kind === "reject") {
    next = pushFeed(
      next,
      "reject",
      // Not "the server's N": with a sibling bid still pending, the price now
      // on screen can be that sibling's optimistic value rather than the
      // server's. Say what is displayed, and let the reason code say why.
      `${labelOf(m.to)} rolled back ${m.amount} · showing ${selectDisplayPrice(updated)}`
    );
  }
  return next;
}

/** max(server price, best pending) — the real optimistic display selector. */
function selectDisplayPrice(c: ClientView): number {
  const serverPrice = c.server.highBid?.amount ?? c.server.config.startingPrice;
  const bestPending = c.pending.reduce((max, p) => Math.max(max, p.amount), 0);
  return Math.max(serverPrice, bestPending);
}

/**
 * One tick of the whole system. Returns the same object when nothing was due,
 * so React can bail out of the re-render.
 */
function step(sim: Sim, now: number, latencyMs: number): Sim {
  let s = sim;
  let changed = false;

  // 1. Inbound bids, strictly one at a time, in the order the wire delivered
  //    them. Ties (identical arrival) break by send order, which is the only
  //    tie-break available to a real single-threaded queue too.
  const due = s.toServer
    .filter((m) => m.arriveAt <= now)
    .sort((a, b) => a.arriveAt - b.arriveAt || a.id - b.id);
  if (due.length > 0) {
    changed = true;
    s = { ...s, toServer: s.toServer.filter((m) => m.arriveAt > now) };
    for (const m of due) s = serverHandleBid(s, m, now, latencyMs);
  }

  // 2. The alarm.
  if (s.server.status === "open" && now >= s.server.endsAtMs) {
    changed = true;
    s = serverAlarm(s, now, latencyMs);
  }

  // 3. Server messages landing back at the clients.
  const dueOut = s.toClient
    .filter((m) => m.arriveAt <= now)
    .sort((a, b) => a.arriveAt - b.arriveAt || a.id - b.id);
  if (dueOut.length > 0) {
    changed = true;
    s = { ...s, toClient: s.toClient.filter((m) => m.arriveAt > now) };
    for (const m of dueOut) s = clientApply(s, m);
  }

  return changed ? s : sim;
}

/* ===========================================================================
 * View
 * =========================================================================== */

const TONE_CLASS: Record<FeedItem["tone"], string> = {
  accept: "text-signal-green",
  reject: "text-signal-red",
  wire: "text-ink-tertiary",
  clock: "text-signal-amber",
};

const TONE_MARK: Record<FeedItem["tone"], string> = {
  accept: "✓",
  reject: "✕",
  wire: "→",
  clock: "◷",
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "no bid yet",
  provisional: "provisional",
  confirmed: "confirmed",
  rejected: "rolled back",
};

const STATUS_CLASS: Record<Status, string> = {
  idle: "text-ink-tertiary",
  provisional: "text-signal-amber",
  confirmed: "text-signal-green",
  rejected: "text-signal-red",
};

export default function OpenBidPlayground() {
  const [sim, setSim] = useState<Sim>(() => freshRoom(Date.now()));
  const [latencyMs, setLatencyMs] = useState(220);
  const [now, setNow] = useState(() => Date.now());
  const [amountStr, setAmountStr] = useState(String(ROOM_DEFAULTS.startingPrice));

  // The slider is read inside an interval, so keep a ref rather than
  // re-creating the interval on every drag.
  const latencyRef = useRef(latencyMs);
  latencyRef.current = latencyMs;

  useEffect(() => {
    const sid = window.setInterval(() => {
      const t = Date.now();
      setSim((s) => step(s, t, latencyRef.current));
    }, 50);
    const cid = window.setInterval(() => setNow(Date.now()), 250);
    return () => {
      window.clearInterval(sid);
      window.clearInterval(cid);
    };
  }, []);

  const serverMin = minimumBid(sim.server);

  // Follow the minimum upward, but never fight a half-typed value: only a
  // field still holding the *previous* minimum verbatim gets replaced. Same
  // rule as openbid's own BidForm.
  const syncedMinRef = useRef(serverMin);
  useEffect(() => {
    // Read the ref into a local *before* queueing the update. A `setState`
    // updater outside render runs during the next render, by which point a
    // `syncedMinRef.current = serverMin` written here would already have
    // landed — the comparison would then be `current === String(serverMin)`,
    // never true for a stale field, and the field would silently stop
    // following the minimum. (Verified in the browser: it did.)
    const previousMin = syncedMinRef.current;
    syncedMinRef.current = serverMin;
    setAmountStr((current) => (current === String(previousMin) ? String(serverMin) : current));
  }, [serverMin]);

  const amount = Number(amountStr);
  const amountValid = Number.isFinite(amount) && amount > 0;

  const reset = useCallback(() => {
    const t = Date.now();
    setSim(freshRoom(t));
    setAmountStr(String(ROOM_DEFAULTS.startingPrice));
    syncedMinRef.current = ROOM_DEFAULTS.startingPrice;
    setNow(t);
  }, []);

  /** The headline interaction: two bidders, same price, same instant. */
  const fireRace = useCallback(() => {
    if (!amountValid) return;
    // Two separate connections, so two independent draws. Nothing downstream
    // knows which is smaller — that is the whole point.
    const t = Date.now();
    const jitterYou = drawJitter();
    const jitterRival = drawJitter();
    setSim((s) => {
      let next = enqueueBid(s, "you", amount, t, latencyRef.current, 0, jitterYou);
      next = enqueueBid(next, "rival", amount, t, latencyRef.current, 0, jitterRival);
      return next;
    });
  }, [amount, amountValid]);

  const bidOne = useCallback(
    (who: BidderId) => {
      if (!amountValid) return;
      const t = Date.now();
      const jitter = drawJitter();
      setSim((s) => enqueueBid(s, who, amount, t, latencyRef.current, 0, jitter));
    },
    [amount, amountValid]
  );

  /* --- scenario presets. Each starts from a fresh room so the arithmetic is
         legible; the rules still decide every outcome. --- */

  const scenarioSnipe = useCallback(() => {
    const t = Date.now();
    const jitter = drawJitter();
    setSim(() => {
      // Deadline 6s out — inside the 10s anti-snipe window — then bid.
      // `validateBid` is what decides to extend it, and by how much.
      const armed = withDeadline(freshRoom(t), t + 6_000);
      return enqueueBid(armed, "you", ROOM_DEFAULTS.startingPrice, t, latencyRef.current, 0, jitter);
    });
    setAmountStr(String(ROOM_DEFAULTS.startingPrice));
    syncedMinRef.current = ROOM_DEFAULTS.startingPrice;
    setNow(t);
  }, []);

  const scenarioTooLow = useCallback(() => {
    const t = Date.now();
    const jitter = drawJitter();
    setSim(() => enqueueBid(freshRoom(t), "you", 90, t, latencyRef.current, 0, jitter));
    setAmountStr("90");
    syncedMinRef.current = ROOM_DEFAULTS.startingPrice;
    setNow(t);
  }, []);

  const scenarioOverBudget = useCallback(() => {
    const t = Date.now();
    const jitter = drawJitter();
    setSim(() => enqueueBid(freshRoom(t), "you", 1_500, t, latencyRef.current, 0, jitter));
    setAmountStr("1500");
    syncedMinRef.current = ROOM_DEFAULTS.startingPrice;
    setNow(t);
  }, []);

  const scenarioFlood = useCallback(() => {
    const t = Date.now();
    setSim(() => {
      // 12 bids from one connection, each a legal increment above the last.
      // The bucket holds 10 tokens; the rules decide which ones survive.
      let next = freshRoom(t);
      for (let i = 0; i < 12; i += 1) {
        next = enqueueBid(
          next,
          "you",
          ROOM_DEFAULTS.startingPrice + i * ROOM_DEFAULTS.minIncrement,
          t,
          latencyRef.current,
          i * 15
          // No jitter: one socket, so a burst down it arrives in send order.
        );
      }
      return next;
    });
    setNow(t);
  }, []);

  const scenarioClosed = useCallback(() => {
    const t = Date.now();
    const jitter = drawJitter();
    setSim(() => {
      // Deadline already in the past: the alarm closes the room on the very
      // next tick, before this bid's simulated packet lands.
      const expired = withDeadline(freshRoom(t), t - 1);
      return enqueueBid(expired, "you", ROOM_DEFAULTS.startingPrice, t, latencyRef.current, 0, jitter);
    });
    setAmountStr(String(ROOM_DEFAULTS.startingPrice));
    syncedMinRef.current = ROOM_DEFAULTS.startingPrice;
    setNow(t);
  }, []);

  const remainingMs = sim.server.status === "closed" ? 0 : sim.server.endsAtMs - now;
  // Visible for exactly as long as the extension it explains, so the note and
  // the clock it describes expire together.
  const justExtended =
    sim.extendedAt !== null && now - sim.extendedAt < ROOM_DEFAULTS.antiSnipeExtensionMs;
  const inFlight = sim.toServer.length + sim.toClient.length;

  const converged = useMemo(() => {
    const prices = BIDDERS.map((b) => selectDisplayPrice(sim.clients[b.id]));
    const settled = BIDDERS.every((b) => sim.clients[b.id].pending.length === 0);
    return { agree: prices[0] === prices[1], settled, price: prices[0] };
  }, [sim]);

  const winnerLabel =
    sim.server.winner === null ? null : labelOf(sim.server.winner.participantId);

  return (
    <PgShell>
      <PgPanel title="The room · one Durable Object">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatValue
              label="Server price"
              value={String(sim.server.highBid?.amount ?? sim.server.config.startingPrice)}
            />
            <StatValue label="Next minimum" value={String(serverMin)} />
            <StatValue
              label={sim.server.status === "closed" ? "Closed" : "Ends in"}
              value={formatRemaining(remainingMs)}
              tone={justExtended ? "amber" : "cyan"}
            />
          </div>

          {justExtended && (
            <p className="font-mono text-[0.6875rem] tabular-nums text-signal-amber">
              anti-snipe: deadline → that bid +{ROOM_DEFAULTS.antiSnipeExtensionMs / 1000}s
            </p>
          )}
          {sim.server.status === "closed" && (
            <p className="text-[0.8125rem] text-ink-secondary">
              {winnerLabel === null
                ? "Closed with no bids."
                : `Closed — ${winnerLabel} won at ${sim.server.winner?.amount}.`}
            </p>
          )}

          <div>
            <label
              htmlFor="openbid-amount"
              className="mb-2 block text-[0.8125rem] text-ink-secondary"
            >
              Bid amount{" "}
              <span className="font-mono tabular-nums text-ink-tertiary">
                (budget cap {ROOM_DEFAULTS.startingBudget})
              </span>
            </label>
            <PgInput
              id="openbid-amount"
              name="openbid-amount"
              type="number"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              aria-label="Bid amount"
            />
          </div>

          <PgButton onClick={fireRace} disabled={!amountValid} className="w-full">
            Fire both bids at {amountValid ? amount : "—"}
          </PgButton>
          <div className="grid grid-cols-2 gap-2">
            <PgButton variant="secondary" onClick={() => bidOne("you")} disabled={!amountValid}>
              You bid
            </PgButton>
            <PgButton variant="secondary" onClick={() => bidOne("rival")} disabled={!amountValid}>
              Rival bids
            </PgButton>
          </div>

          <PgSlider
            label="One-way network latency"
            value={latencyMs}
            min={0}
            max={600}
            step={20}
            onChange={setLatencyMs}
            format={(v) => `${v} ms`}
          />

          <ScenarioBar
            scenarios={[
              { label: "Snipe the deadline", onClick: scenarioSnipe },
              { label: "TOO_LOW", onClick: scenarioTooLow },
              { label: "INSUFFICIENT_BUDGET", onClick: scenarioOverBudget },
              { label: "RATE_LIMITED", onClick: scenarioFlood },
              { label: "AUCTION_CLOSED", onClick: scenarioClosed },
            ]}
          />
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[0.6875rem] text-ink-tertiary underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-ink-secondary"
          >
            reset room
          </button>

          <PgNote>
            The rules running here are a hand port of openbid&apos;s{" "}
            <code className="font-mono">packages/auction-core</code> —{" "}
            <code className="font-mono">validateBid</code> decides every outcome above, including
            which bid wins a tie. The network, the Durable Object&apos;s one-message-at-a-time
            delivery and the alarm clock are simulated in this tab; nothing here calls a server.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="Two clients, one authority">
        <div className="space-y-4">
          <div
            className="rounded-control bg-void-card px-3 py-2 text-[0.75rem] leading-snug ring-1 ring-inset ring-line-subtle"
            role="status"
          >
            {converged.settled ? (
              converged.agree ? (
                <span className="text-signal-green">
                  <span aria-hidden="true">✓ </span>Both clients agree at{" "}
                  <span className="font-mono tabular-nums">{converged.price}</span> · 0 unconfirmed
                </span>
              ) : (
                <span className="text-signal-red">
                  <span aria-hidden="true">✕ </span>Clients disagree — that would be a bug
                </span>
              )
            ) : (
              <span className="text-signal-amber">
                <span aria-hidden="true">◷ </span>
                {inFlight} message{inFlight === 1 ? "" : "s"} in flight — prices are provisional
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BIDDERS.map((b) => {
              const c = sim.clients[b.id];
              const price = selectDisplayPrice(c);
              const provisional = c.pending.length > 0;
              // A pending bid outranks any earlier settled outcome: the price
              // on screen is provisional, so the badge must say so too. Before
              // this, `c.status` could still read "confirmed" from a previous
              // bid while the number above it was an unconfirmed guess — the
              // two channels contradicting each other.
              const status: Status = provisional ? "provisional" : c.status;
              return (
                <div
                  key={b.id}
                  className="min-w-0 rounded-control bg-void-card p-3 ring-1 ring-inset ring-line-subtle"
                >
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">
                    {b.label}
                  </div>
                  {/* Provisional is carried by three things, not colour alone
                      — a dotted underline, the pulsing dot, and the word
                      itself (HIG "Color": never colour on its own). */}
                  <div
                    className={`mt-1 font-mono text-[1.375rem] font-semibold leading-tight tabular-nums ${
                      provisional
                        ? "text-signal-amber underline decoration-dotted decoration-1 underline-offset-4"
                        : "text-ink-primary"
                    }`}
                  >
                    {price}
                  </div>
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 text-[0.6875rem] leading-snug ${STATUS_CLASS[status]}`}
                  >
                    {status === "provisional" && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-amber motion-safe:animate-pulse"
                      />
                    )}
                    <span className="min-w-0 break-words">
                      {STATUS_LABEL[status]}
                      {status === "rejected" && c.rejectReason ? ` · ${c.rejectReason}` : ""}
                    </span>
                  </div>
                  {status === "rejected" && c.rejectReason && (
                    <p className="mt-1.5 text-[0.6875rem] leading-snug text-ink-tertiary">
                      {REJECT_COPY[c.rejectReason]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">
              <span>Event log · serverSeq</span>
              <span className="shrink-0 font-mono normal-case tabular-nums tracking-normal">
                {sim.log.length} appended
              </span>
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto">
              {sim.feed.length === 0 && (
                <p className="text-[0.75rem] text-ink-tertiary">
                  Nothing yet. Fire both bids at the same price and watch one of them lose.
                </p>
              )}
              <AnimatePresence initial={false}>
                {sim.feed.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.micro, ease: EASE }}
                    className={`flex gap-1.5 font-mono text-[0.6875rem] leading-[1.5] tabular-nums ${TONE_CLASS[f.tone]}`}
                  >
                    <span aria-hidden="true" className="shrink-0">
                      {TONE_MARK[f.tone]}
                    </span>
                    <span className="min-w-0 break-words">{f.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-[0.75rem] leading-[1.6] text-ink-tertiary">
            Bid ordering is serialised by construction: the second of two simultaneous bids cannot
            observe stale state, because it does not start running until the first has appended its
            event. Nothing here holds a lock.
          </p>
        </div>
      </PgPanel>
    </PgShell>
  );
}
