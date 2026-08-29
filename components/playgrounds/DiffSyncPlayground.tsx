"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";
import { PgShell, PgPanel, PgButton, PgInput, ScenarioBar, PgNote, StatValue } from "./ui";
import { DUR, EASE } from "@/lib/motion";

/* ===========================================================================
 * PORTED LOGIC — a copy of diffsync's real code, not a reimplementation.
 *
 * Everything between here and the FIXTURE banner below is a faithful,
 * hand-copied port of diffsync's pure packages, so every verdict this
 * playground shows is decided by the project's own rules rather than by a
 * script that already knows the answer:
 *
 *   CONTEXT_RADIUS, GAP, Window, Anchor, AnchorTarget, Relocation
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/anchor/src/types.ts
 *   normalizeLine, windowAt, fingerprint, createAnchor
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/anchor/src/fingerprint.ts
 *   MIN_DISTINCTIVE_SLOTS, relocate            (the five rules)
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/anchor/src/relocate.ts
 *   parseUnifiedDiff, DiffParseError
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/diff/src/parse.ts
 *   toAnchorTarget
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/diff/src/target.ts
 *   placeThreads                               (placement is derived, never stored)
 *      https://github.com/shivangraval50/diffsync/blob/main/packages/threads/src/place.ts
 *
 * This is a copy, not an import — the portfolio takes no dependency on
 * diffsync — so if the upstream rules change, this block has to be updated by
 * hand. `packages/anchor` is portable at all only because it is pure: zero
 * I/O, zero platform imports, zero clock reads. The doc comments upstream are
 * long and argue the design at length; they are abridged here, and the links
 * above are the authority.
 * =========================================================================== */

/** Lines either side of the anchored line: a window is 2 * R + 1 = 7 slots. */
const CONTEXT_RADIUS = 3;

/**
 * Occupies a window slot for which no line text is known — past the ends of
 * the rendered file, or a line the diff simply does not expose. U+0000 cannot
 * occur in a line that survived a unified diff, so an unknown slot can never
 * compare equal to a known one.
 */
const GAP = "\u0000GAP";

// The window is a fixed-length tuple type, not `string[]`, so slicing or
// truncating one before hashing it is a compile error rather than a silently
// weaker fingerprint. Length is derived from CONTEXT_RADIUS, not written "7".
type FixedTuple<N extends number, T, Acc extends readonly T[] = []> = Acc["length"] extends N
  ? Acc
  : FixedTuple<N, T, readonly [T, ...Acc]>;
type RadiusSlots = FixedTuple<typeof CONTEXT_RADIUS, unknown>;
type WindowSlots = readonly [...RadiusSlots, unknown, ...RadiusSlots];
type MapToString<T extends readonly unknown[]> = { readonly [K in keyof T]: string };
type AnchorWindow = MapToString<WindowSlots>;

/** Where a comment points. `context` is the window itself, not just its hash:
 *  `relocate` confirms every fingerprint hit against it, so a hash collision
 *  degrades to `outdated` instead of to a silent mis-anchor. */
interface Anchor {
  filePath: string;
  blobSha: string;
  line: number;
  fingerprint: string;
  context: readonly string[];
}

/** The new-side content `relocate` searches. Deliberately sparse: a unified
 *  diff exposes only the lines inside its hunks. */
interface AnchorTarget {
  filePath: string;
  blobSha: string;
  lines: ReadonlyMap<number, string>;
}

/** Exactly two outcomes. No `line: number | null`, no best-effort branch. */
type Relocation = { kind: "located"; line: number } | { kind: "outdated" };

/** Trailing whitespace and CRs are normalized away because the same file
 *  arrives with different line endings depending on where it came from.
 *  Leading whitespace is preserved: a re-indent is a real change. */
function normalizeLine(text: string): string {
  return text.replace(/[ \t\r]+$/u, "");
}

/** The normalized CONTEXT_RADIUS-radius window centred on `line`. */
function windowAt(lines: ReadonlyMap<number, string>, line: number): AnchorWindow {
  const out: string[] = [];
  for (let n = line - CONTEXT_RADIUS; n <= line + CONTEXT_RADIUS; n += 1) {
    const text = lines.get(n);
    out.push(text === undefined ? GAP : normalizeLine(text));
  }
  // The loop always runs exactly 2 * CONTEXT_RADIUS + 1 times, so this is the
  // one place allowed to assert a plain array into a window.
  return out as unknown as AnchorWindow;
}

// FNV-1a, 64-bit, over BigInt: `packages/anchor` may not import node:crypto
// (it runs in a Worker, a browser and Node), and 32 bits collide often enough
// at PR scale to be worth avoiding in an index.
// One deviation from a verbatim copy, and only in spelling: upstream writes
// these as BigInt literals (`0xcbf29ce484222325n`), which this site's
// tsconfig `target: ES2017` rejects as a syntax error. Same three constants,
// same values, built through the constructor instead.
const FNV_OFFSET_BASIS = BigInt("0xcbf29ce484222325");
const FNV_PRIME = BigInt("0x100000001b3");
const MASK_64 = BigInt("0xffffffffffffffff");
const SLOT_SEPARATOR = "\u0000";

/** FNV-1a over a window's seven slots, joined with a NUL separator that
 *  cannot occur inside a normalized source line. Takes a window, not
 *  `readonly string[]`, on purpose — see the tuple type above. */
function fingerprint(window: AnchorWindow): string {
  const encoded = window.join(SLOT_SEPARATOR);
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < encoded.length; i += 1) {
    const unit = encoded.charCodeAt(i);
    // Both bytes of the UTF-16 code unit, low byte first. Folding to one byte
    // would collide "A" (U+0041) with U+0141 and every other pair sharing a
    // low byte.
    hash = ((hash ^ BigInt(unit & 0xff)) * FNV_PRIME) & MASK_64;
    hash = ((hash ^ BigInt(unit >>> 8)) * FNV_PRIME) & MASK_64;
  }
  return hash.toString(16).padStart(16, "0");
}

/** Build an anchor for `line` within `target`, or null when the target does
 *  not expose that line at all. */
function createAnchor(target: AnchorTarget, line: number): Anchor | null {
  if (!target.lines.has(line)) return null;
  const context = windowAt(target.lines, line);
  return {
    filePath: target.filePath,
    blobSha: target.blobSha,
    line,
    fingerprint: fingerprint(context),
    context,
  };
}

function sameWindow(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Minimum number of *distinctive* slots an anchor's stored context must carry
 * before the scan path (rules 3/4) is allowed to trust a window match at all.
 * A slot is distinctive when it is neither `GAP` nor blank — a blank line
 * carries the same lack of information as an unexposed one. A window like
 * [GAP,GAP,GAP,"}",GAP,GAP,GAP] matches every isolated `}` in the file; it is
 * not evidence, and rule 4 only helps when both occurrences happen to be
 * visible in the same scan.
 */
const MIN_DISTINCTIVE_SLOTS = 4;

function isDistinctiveSlot(slot: string): boolean {
  return slot !== GAP && slot.trim() !== "";
}

function distinctiveSlotCount(context: readonly string[]): number {
  let count = 0;
  for (const slot of context) {
    if (isDistinctiveSlot(slot)) count += 1;
  }
  return count;
}

/**
 * Find where `anchor` points inside `target`, or report that it no longer
 * points anywhere findable. There is no third outcome and no best-effort
 * branch: a thread that quietly re-points at different code makes reviewers
 * argue about code nobody wrote, and losing the position and saying so is
 * strictly cheaper.
 */
function relocate(anchor: Anchor, target: AnchorTarget): Relocation {
  // 1. Renames are out of scope. Following one would be a guess.
  if (anchor.filePath !== target.filePath) return { kind: "outdated" };

  // 2. A blob sha is content-addressed: equal sha means equal bytes, which is
  //    stronger evidence than any window — so this fast path deliberately
  //    skips the distinctiveness precondition below. The line must still be
  //    exposed by this rendering: a thread needs a row to attach to.
  if (anchor.blobSha === target.blobSha && target.lines.has(anchor.line)) {
    return { kind: "located", line: anchor.line };
  }

  // 5. Precondition on the anchor itself, checked before scanning: a window
  //    this sparse (or this blank) is not distinctive enough to relocate on
  //    safely, no matter what the target contains.
  if (distinctiveSlotCount(anchor.context) < MIN_DISTINCTIVE_SLOTS) {
    return { kind: "outdated" };
  }

  // 3./4. Scan. The fingerprint is the index; `anchor.context` is the proof.
  let found: number | null = null;
  for (const line of target.lines.keys()) {
    const candidate = windowAt(target.lines, line);
    if (fingerprint(candidate) !== anchor.fingerprint) continue;
    if (!sameWindow(candidate, anchor.context)) continue;
    // A second equally good candidate means the anchor is ambiguous. Two
    // answers is the same as no answer: report outdated rather than pick.
    if (found !== null) return { kind: "outdated" };
    found = line;
  }

  return found === null ? { kind: "outdated" } : { kind: "located", line: found };
}

// --- packages/diff -------------------------------------------------------

type DiffLine =
  | { kind: "context"; text: string; oldLine: number; newLine: number }
  | { kind: "added"; text: string; newLine: number }
  | { kind: "removed"; text: string; oldLine: number };

interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  heading: string;
  lines: DiffLine[];
}

class DiffParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiffParseError";
  }
}

const HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/u;

/**
 * Parse the hunk body of a unified diff — the GitHub `files[].patch` shape.
 * Throws rather than skipping anything it does not recognise: a parser that
 * silently drops a line it cannot classify shifts every subsequent line
 * number, and a shifted line number is exactly the silent mis-anchor this
 * project exists to prevent.
 */
function parseUnifiedDiff(patch: string): DiffHunk[] {
  if (patch === "") return [];

  const hunks: DiffHunk[] = [];
  let current: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  for (const raw of patch.split("\n")) {
    const header = HEADER.exec(raw);
    if (header !== null) {
      if (current !== null) verifyCounts(current);
      current = {
        oldStart: Number(header[1]),
        oldCount: header[2] === undefined ? 1 : Number(header[2]),
        newStart: Number(header[3]),
        newCount: header[4] === undefined ? 1 : Number(header[4]),
        heading: header[5] ?? "",
        lines: [],
      };
      oldLine = current.oldStart;
      newLine = current.newStart;
      hunks.push(current);
      continue;
    }

    if (current === null) {
      if (raw === "") continue;
      throw new DiffParseError(`content before the first hunk header: ${JSON.stringify(raw)}`);
    }

    if (raw.startsWith("\\")) continue; // "\ No newline at end of file"

    const marker = raw.slice(0, 1);
    const text = raw.slice(1);
    let line: DiffLine;
    if (raw === "" || marker === " ") {
      line = { kind: "context", text: raw === "" ? "" : text, oldLine, newLine };
      oldLine += 1;
      newLine += 1;
    } else if (marker === "+") {
      line = { kind: "added", text, newLine };
      newLine += 1;
    } else if (marker === "-") {
      line = { kind: "removed", text, oldLine };
      oldLine += 1;
    } else {
      throw new DiffParseError(`unrecognised diff line: ${JSON.stringify(raw)}`);
    }
    current.lines.push(line);
  }

  if (current !== null) verifyCounts(current);
  return hunks;
}

function verifyCounts(hunk: DiffHunk): void {
  let oldSeen = 0;
  let newSeen = 0;
  for (const line of hunk.lines) {
    if (line.kind !== "added") oldSeen += 1;
    if (line.kind !== "removed") newSeen += 1;
  }
  if (oldSeen !== hunk.oldCount || newSeen !== hunk.newCount) {
    throw new DiffParseError(
      `hunk body contradicts its header counts: header says -${hunk.oldCount} +${hunk.newCount}, ` +
        `body has -${oldSeen} +${newSeen}`
    );
  }
}

/** The new-side lines this file exposes: context and additions, keyed by
 *  new-side line number. Removed lines are absent — they have no new-side
 *  position, so a comment cannot be anchored to one. */
function toAnchorTargetLines(hunks: readonly DiffHunk[]): Map<number, string> {
  const lines = new Map<number, string>();
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.kind === "removed") continue;
      lines.set(line.newLine, line.text);
    }
  }
  return lines;
}

// --- packages/threads ----------------------------------------------------

interface Thread {
  threadId: string;
  nickname: string;
  body: string;
  anchor: Anchor;
}

interface PlacedThread {
  thread: Thread;
  placement: Relocation;
}

/** Placement is derived on every render from the thread's original anchor and
 *  the current revision's targets — nothing is stored, so a thread can never
 *  be displayed at a position that was true for a revision the reader is not
 *  looking at. */
function placeThreads(
  threads: readonly Thread[],
  targets: ReadonlyMap<string, AnchorTarget>
): PlacedThread[] {
  return threads.map((thread) => {
    const target = targets.get(thread.anchor.filePath);
    return {
      thread,
      placement: target === undefined ? { kind: "outdated" } : relocate(thread.anchor, target),
    };
  });
}

/* ===========================================================================
 * FIXTURE — `auth-refactor`, copied verbatim from the diffsync repo.
 *   https://github.com/shivangraval50/diffsync/blob/main/packages/fixtures/src/data/authRefactor.ts
 *
 * Its two revisions are chosen so that one force-push produces all three
 * behaviours: session.ts gains a guard clause ABOVE the anchored region (a
 * thread relocates 15 -> 18), token.ts has the anchored region rewritten (a
 * thread goes outdated), and README.md is untouched (its content is identical
 * across revisions, so a thread on it stays put via the sha-equality path).
 * These are the same patches the deployed app and the Playwright force-push
 * spec run against.
 * =========================================================================== */

interface FixtureFile {
  path: string;
  status: string;
  patch: string;
}

const REVISIONS: { headSha: string; files: FixtureFile[] }[] = [
  {
    headSha: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    files: [
      {
        path: "src/auth/session.ts",
        status: "modified",
        patch: [
          "@@ -12,8 +12,9 @@ export function createSession(user) {",
          "   const now = Date.now();",
          "   const session = {",
          "     userId: user.id,",
          "-    expiresAt: now + ONE_HOUR,",
          "+    expiresAt: now + SESSION_TTL_MS,",
          "+    issuedAt: now,",
          "   };",
          "   store.set(session.userId, session);",
          "   return session;",
          " }",
        ].join("\n"),
      },
      {
        path: "src/auth/token.ts",
        status: "modified",
        patch: [
          "@@ -4,4 +4,5 @@ export function signToken(payload) {",
          '   const header = { alg: "HS256" };',
          "-  const body = encode(payload);",
          "+  const body = encode({ ...payload, iat: Date.now() });",
          "+  const sig = sign(header, body, SECRET);",
          '   return [header, body].join(".");',
          " }",
        ].join("\n"),
      },
      {
        path: "README.md",
        status: "modified",
        patch: [
          "@@ -1,3 +1,4 @@",
          " # Example service",
          " ",
          "+Sessions now carry an issue time.",
          " Run `npm start` to boot it.",
        ].join("\n"),
      },
    ],
  },
  {
    headSha: "9f8e7d6c5b4a39281706f5e4d3c2b1a098765432",
    files: [
      {
        path: "src/auth/session.ts",
        status: "modified",
        patch: [
          "@@ -11,9 +11,13 @@ export function createSession(user) {",
          "   assertUser(user);",
          "+  if (user.banned) {",
          '+    throw new Error("banned");',
          "+  }",
          "   const now = Date.now();",
          "   const session = {",
          "     userId: user.id,",
          "-    expiresAt: now + ONE_HOUR,",
          "+    expiresAt: now + SESSION_TTL_MS,",
          "+    issuedAt: now,",
          "   };",
          "   store.set(session.userId, session);",
          "   return session;",
          " }",
        ].join("\n"),
      },
      {
        path: "src/auth/token.ts",
        status: "modified",
        patch: [
          "@@ -3,5 +3,6 @@",
          " export function signToken(payload) {",
          '-  const header = { alg: "HS256" };',
          "-  const body = encode(payload);",
          '+  const header = { alg: "HS512" };',
          "+  const body = encodeCompact(payload, { iat: now() });",
          "+  const sig = signHmac(header, body, readSecret());",
          '   return [header, body].join(".");',
          " }",
        ].join("\n"),
      },
      {
        path: "README.md",
        status: "modified",
        patch: [
          "@@ -1,3 +1,4 @@",
          " # Example service",
          " ",
          "+Sessions now carry an issue time.",
          " Run `npm start` to boot it.",
        ].join("\n"),
      },
    ],
  },
];

/** Parsed once: the patches are static, and `parseUnifiedDiff` throws on
 *  anything malformed, so a typo in the fixture above fails loudly at module
 *  load rather than rendering a diff with shifted line numbers. */
const PARSED: { headSha: string; files: { path: string; status: string; hunks: DiffHunk[] }[] }[] =
  REVISIONS.map((rev) => ({
    headSha: rev.headSha,
    files: rev.files.map((f) => ({ path: f.path, status: f.status, hunks: parseUnifiedDiff(f.patch) })),
  }));

/* ===========================================================================
 * SIMULATION — this playground's own code. NOT part of diffsync.
 *
 * The ported rules above are the whole decision surface. They need three
 * things this tab doesn't otherwise have, and those three things are what
 * this section supplies:
 *
 *   1. A blob sha. Git's is SHA-1 over the whole file, which a browser can't
 *      compute for lines a diff never showed, and the fixture's literal
 *      placeholders ("blob-session-r1") would stop tracking content the
 *      moment you edited a line here. So a file's sha is derived from the
 *      lines it exposes with the same FNV-1a the anchor package uses. That
 *      keeps the one property `relocate`'s rule 2 actually depends on —
 *      equal content implies equal sha — true under live editing. It is
 *      weaker than git in one way worth naming: two files whose *rendered*
 *      lines agree but whose unrendered remainder differs would collide here
 *      and not in git.
 *   2. The Durable Object, the WebSocket and the other reviewers. There are
 *      none: this is one tab, and the thread log is React state. diffsync's
 *      concurrency story (one DO per PR, append-only log, pure fold) is the
 *      subject of its README, not of this demo — the demo's subject is what
 *      happens to an anchor when the code under it moves.
 *   3. A narration. `relocate` returns only `located` or `outdated`; it does
 *      not say why, on purpose. `explainPlacement` below re-runs the same
 *      five checks in the same order purely to label the outcome for a
 *      reader. The badge you see is always `relocate`'s answer; only the
 *      sentence under it is this file's.
 * =========================================================================== */

/** FNV-1a over an arbitrary string. Same constants as `fingerprint`, kept
 *  separate so the ported function keeps its window-shaped parameter — see
 *  the tuple-type argument above. */
function hashString(input: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i += 1) {
    const unit = input.charCodeAt(i);
    hash = ((hash ^ BigInt(unit & 0xff)) * FNV_PRIME) & MASK_64;
    hash = ((hash ^ BigInt(unit >>> 8)) * FNV_PRIME) & MASK_64;
  }
  return hash.toString(16).padStart(16, "0");
}

function contentSha(lines: ReadonlyMap<number, string>): string {
  const parts: string[] = [];
  for (const [n, text] of lines) parts.push(`${n}\u0000${normalizeLine(text)}`);
  return hashString(parts.join("\u0001"));
}

/** Visitor edits, keyed by revision + path + new-side line number. An entry
 *  equal to the fixture's own text is removed rather than stored, so undoing
 *  an edit by hand restores the original sha exactly. */
type Edits = Record<string, string>;

const editKey = (rev: number, path: string, line: number) => `${rev}|${path}|${line}`;

const RENAMED_TO: Record<string, string> = { "README.md": "docs/README.md" };

interface RenderedFile {
  /** The path this revision shows the file at — the rename scenario changes it. */
  path: string;
  originalPath: string;
  status: string;
  hunks: DiffHunk[];
  target: AnchorTarget;
}

function buildRevision(revIndex: number, edits: Edits, renamed: boolean): RenderedFile[] {
  const rev = PARSED[revIndex];
  return rev.files.map((file) => {
    const path = renamed && revIndex === 1 && RENAMED_TO[file.path] ? RENAMED_TO[file.path] : file.path;
    // Edits are applied to the parsed hunks, so the rendered diff and the
    // AnchorTarget can never disagree about what a line says.
    const hunks: DiffHunk[] = file.hunks.map((hunk) => ({
      ...hunk,
      lines: hunk.lines.map((line) => {
        if (line.kind === "removed") return line;
        const edited = edits[editKey(revIndex, file.path, line.newLine)];
        return edited === undefined ? line : { ...line, text: edited };
      }),
    }));
    const lines = toAnchorTargetLines(hunks);
    return { path, originalPath: file.path, status: file.status, hunks, target: { filePath: path, blobSha: contentSha(lines), lines } };
  });
}

interface Explanation {
  rule: string;
  text: string;
}

/**
 * Narration only. Mirrors `relocate`'s five rules in the same order so the
 * sentence always agrees with the badge, but the badge itself is rendered
 * from `relocate`'s return value, never from this.
 */
function explainPlacement(anchor: Anchor, target: AnchorTarget | undefined): Explanation {
  if (target === undefined) {
    return {
      rule: "rule 1",
      text: `no file at ${anchor.filePath} in this revision — renames are not followed, because following one would be a guess`,
    };
  }
  if (anchor.filePath !== target.filePath) {
    return { rule: "rule 1", text: "the file is at a different path now — renames are not followed" };
  }
  if (anchor.blobSha === target.blobSha) {
    if (target.lines.has(anchor.line)) {
      return { rule: "rule 2", text: "blob sha unchanged — equal sha means equal bytes, so the same line" };
    }
    // Falls through to the scan, exactly as relocate does.
  }
  const distinctive = distinctiveSlotCount(anchor.context);
  if (distinctive < MIN_DISTINCTIVE_SLOTS) {
    return {
      rule: "rule 5",
      text: `only ${distinctive} of 7 window slots are distinctive, and ${MIN_DISTINCTIVE_SLOTS} are required — refused to scan on evidence that thin`,
    };
  }
  const matches: number[] = [];
  for (const line of target.lines.keys()) {
    const candidate = windowAt(target.lines, line);
    if (fingerprint(candidate) !== anchor.fingerprint) continue;
    if (!sameWindow(candidate, anchor.context)) continue;
    matches.push(line);
  }
  if (matches.length === 0) {
    return { rule: "rule 3", text: "no line in this revision carries the stored window — the code it was written about is gone" };
  }
  if (matches.length > 1) {
    return {
      rule: "rule 4",
      text: `${matches.length} lines carry the same window — two answers is the same as no answer`,
    };
  }
  const moved = matches[0] - anchor.line;
  return {
    rule: "rule 3",
    text:
      moved === 0
        ? "the stored window was confirmed element-wise at the same line"
        : `the stored window was confirmed element-wise, ${Math.abs(moved)} line${
            Math.abs(moved) === 1 ? "" : "s"
          } ${moved > 0 ? "further down" : "further up"}`,
  };
}

const SEEDS: { threadId: string; nickname: string; body: string; path: string; line: number }[] = [
  {
    threadId: "t-session",
    nickname: "calm-heron-bu6",
    // The two bodies the repo's own force-push Playwright spec types.
    body: "This should survive the push.",
    path: "src/auth/session.ts",
    line: 15,
  },
  {
    threadId: "t-token",
    nickname: "quiet-otter-4f1",
    body: "This code is about to vanish.",
    path: "src/auth/token.ts",
    line: 5,
  },
  {
    threadId: "t-readme",
    nickname: "calm-heron-bu6",
    body: "Worth a changelog line too.",
    path: "README.md",
    line: 1,
  },
];

/** Seeded threads are anchored against the pristine revision 1, which is what
 *  `createAnchor` produces for a reviewer commenting on it. A seed whose line
 *  the revision does not expose is dropped rather than faked. */
function seedThreads(): Thread[] {
  const files = buildRevision(0, {}, false);
  const out: Thread[] = [];
  for (const seed of SEEDS) {
    const file = files.find((f) => f.path === seed.path);
    if (file === undefined) continue;
    const anchor = createAnchor(file.target, seed.line);
    if (anchor === null) continue;
    out.push({ threadId: seed.threadId, nickname: seed.nickname, body: seed.body, anchor });
  }
  return out;
}

const YOU = "you (guest)";

export default function DiffSyncPlayground() {
  const [revIndex, setRevIndex] = useState(0);
  const [edits, setEdits] = useState<Edits>({});
  const [renamed, setRenamed] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(seedThreads);
  const [composer, setComposer] = useState<{ path: string; line: number } | null>(null);
  const [draft, setDraft] = useState("");
  const [nextId, setNextId] = useState(1);

  const files = useMemo(() => buildRevision(revIndex, edits, renamed), [revIndex, edits, renamed]);
  const targets = useMemo(
    () => new Map(files.map((f) => [f.path, f.target] as const)),
    [files]
  );
  const placed = useMemo(() => placeThreads(threads, targets), [threads, targets]);

  const located = placed.filter((p) => p.placement.kind === "located");
  const outdated = placed.filter((p) => p.placement.kind === "outdated");

  /** Located threads, grouped by the path and line `relocate` put them at —
   *  never by the line they were written at. */
  const inline = useMemo(() => {
    const map = new Map<string, PlacedThread[]>();
    for (const p of placed) {
      if (p.placement.kind !== "located") continue;
      const key = `${p.thread.anchor.filePath}|${p.placement.line}`;
      const list = map.get(key);
      if (list === undefined) map.set(key, [p]);
      else list.push(p);
    }
    return map;
  }, [placed]);

  const setLine = useCallback(
    (path: string, line: number, text: string, original: string) => {
      setEdits((prev) => {
        const next = { ...prev };
        const key = editKey(revIndex, path, line);
        if (text === original) delete next[key];
        else next[key] = text;
        return next;
      });
    },
    [revIndex]
  );

  const addThread = useCallback(
    (path: string, line: number, body: string) => {
      const target = targets.get(path);
      if (target === undefined) return;
      const anchor = createAnchor(target, line);
      if (anchor === null) return;
      setThreads((prev) => [
        ...prev,
        { threadId: `t-you-${nextId}`, nickname: YOU, body, anchor },
      ]);
      setNextId((n) => n + 1);
    },
    [targets, nextId]
  );

  const reset = useCallback(() => {
    setRevIndex(0);
    setEdits({});
    setRenamed(false);
    setThreads(seedThreads());
    setComposer(null);
    setDraft("");
  }, []);

  const scenarioRewrite = useCallback(() => {
    setRevIndex(1);
    setRenamed(false);
    setEdits((prev) => ({
      ...prev,
      [editKey(1, "src/auth/session.ts", 18)]: "    expiresAt: now + ttl(user),",
    }));
  }, []);

  const scenarioRename = useCallback(() => {
    setRevIndex(1);
    setRenamed(true);
  }, []);

  const headSha = PARSED[revIndex].headSha.slice(0, 7);
  const dirty = Object.keys(edits).length > 0 || renamed;

  const summary =
    revIndex === 0 && !dirty
      ? `Revision 1 · ${threads.length} thread${threads.length === 1 ? "" : "s"} sitting on the lines they were written about.`
      : `${located.length} located, ${outdated.length} outdated. Every one of those is relocate()'s answer, recomputed from the anchors — not a stored position.`;

  return (
    <PgShell>
      <PgPanel title="Pull request · auth-refactor">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatValue label="Revision" value={`${revIndex + 1} of 2`} />
            <StatValue label="Located" value={String(located.length)} tone="green" />
            <StatValue
              label="Outdated"
              value={String(outdated.length)}
              tone={outdated.length > 0 ? "amber" : "cyan"}
            />
          </div>

          <p
            role="status"
            aria-live="polite"
            className="rounded-control bg-void-card px-3 py-2 text-[0.75rem] leading-snug text-ink-secondary ring-1 ring-inset ring-line-subtle"
          >
            <span className="font-mono tabular-nums text-ink-tertiary">head {headSha}</span> · {summary}
          </p>

          {/* One control, not a live button plus a dead one: the revision the
              reader is on is already stated above, so a disabled
              "Force-pushed" button would only take space and say it twice. */}
          {revIndex === 0 ? (
            <PgButton onClick={() => setRevIndex(1)} className="w-full">
              Force-push a new revision
            </PgButton>
          ) : (
            <PgButton variant="secondary" onClick={() => setRevIndex(0)} className="w-full">
              Rewind to revision 1
            </PgButton>
          )}

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.originalPath}
                className="overflow-hidden rounded-control bg-void-card ring-1 ring-inset ring-line-subtle"
              >
                <div className="flex items-center justify-between gap-2 border-b border-line-subtle px-2.5 py-1.5">
                  <span className="truncate font-mono text-[0.6875rem] text-ink-secondary">
                    {file.path}
                  </span>
                  <span className="shrink-0 text-[0.625rem] uppercase tracking-label text-ink-tertiary">
                    {file.path === file.originalPath ? file.status : "renamed"}
                  </span>
                </div>
                <div className="overflow-x-auto py-1">
                  {file.hunks.map((hunk) => (
                    <div key={`${hunk.oldStart}-${hunk.newStart}`}>
                      <div className="px-2.5 py-0.5 font-mono text-[0.625rem] leading-[1.8] text-ink-tertiary">
                        <span className="tabular-nums">
                          @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
                        </span>{" "}
                        {hunk.heading}
                      </div>
                      {hunk.lines.map((line, i) => (
                        <DiffRow
                          key={`${line.kind}-${i}`}
                          line={line}
                          path={file.path}
                          threads={
                            line.kind === "removed"
                              ? []
                              : inline.get(`${file.path}|${line.newLine}`) ?? []
                          }
                          composerOpen={
                            line.kind !== "removed" &&
                            composer !== null &&
                            composer.path === file.path &&
                            composer.line === line.newLine
                          }
                          draft={draft}
                          onDraft={setDraft}
                          onOpenComposer={(l) => {
                            setComposer({ path: file.path, line: l });
                            setDraft("");
                          }}
                          onCancelComposer={() => setComposer(null)}
                          onSubmitComposer={(l) => {
                            const body = draft.trim();
                            if (body === "") return;
                            addThread(file.path, l, body);
                            setComposer(null);
                            setDraft("");
                          }}
                          onEdit={(l, text, original) => setLine(file.originalPath, l, text, original)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <ScenarioBar
            scenarios={[
              { label: "Rewrite the relocated line", onClick: scenarioRewrite },
              { label: "Rename README.md", onClick: scenarioRename },
            ]}
          />
          <button
            type="button"
            onClick={reset}
            className="rounded-[0.25rem] font-mono text-[0.6875rem] text-ink-tertiary underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            reset pull request
          </button>

          <PgNote>
            The relocation running here is a hand port of diffsync&apos;s{" "}
            <code className="font-mono">packages/anchor</code> —{" "}
            <code className="font-mono">relocate()</code> decides every verdict on the right,
            including which threads it refuses. The pull request is the project&apos;s own{" "}
            <code className="font-mono">auth-refactor</code> fixture and the diff is parsed by its
            own <code className="font-mono">parseUnifiedDiff</code>. There is no server, no
            Durable Object and no second reviewer in this tab.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="What relocate() decided">
        <div className="space-y-4">
          <div className="space-y-2">
            {placed.map((p) => {
              const target = targets.get(p.thread.anchor.filePath);
              const why = explainPlacement(p.thread.anchor, target);
              const isLocated = p.placement.kind === "located";
              const moved =
                p.placement.kind === "located" && p.placement.line !== p.thread.anchor.line;
              return (
                <motion.div
                  key={p.thread.threadId}
                  layout
                  data-testid={`verdict-${p.thread.threadId}`}
                  className="rounded-control bg-void-card p-3 ring-1 ring-inset ring-line-subtle"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <span className="min-w-0 break-all font-mono text-[0.6875rem] tabular-nums text-ink-secondary">
                      {p.thread.anchor.filePath}:{p.thread.anchor.line}
                    </span>
                    {/* State is carried by the word, not by the colour alone. */}
                    <span
                      className={`shrink-0 font-mono text-[0.6875rem] font-semibold tabular-nums ${
                        isLocated ? "text-signal-green" : "text-signal-amber"
                      }`}
                    >
                      <span aria-hidden="true">{isLocated ? "✓ " : "◷ "}</span>
                      {p.placement.kind === "located"
                        ? moved
                          ? `located · line ${p.thread.anchor.line} → ${p.placement.line}`
                          : `located · line ${p.placement.line}`
                        : "outdated"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.75rem] leading-[1.55] text-ink-secondary">
                    <span className="font-mono text-[0.6875rem] text-ink-tertiary">{why.rule}</span>{" "}
                    — {why.text}
                  </p>
                  <p className="mt-1 font-mono text-[0.625rem] leading-snug tabular-nums text-ink-tertiary">
                    fp {p.thread.anchor.fingerprint.slice(0, 12)}… ·{" "}
                    {distinctiveSlotCount(p.thread.anchor.context)}/7 distinctive
                  </p>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {outdated.length > 0 && (
              <motion.section
                data-testid="outdated-panel"
                aria-label="Outdated threads"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.short, ease: EASE }}
                className="rounded-control bg-signal-amber/[0.06] p-3 ring-1 ring-inset ring-signal-amber/25"
              >
                <h4 className="text-[0.6875rem] font-semibold uppercase tracking-label text-signal-amber">
                  Outdated threads
                </h4>
                <p className="mt-1.5 text-[0.75rem] leading-[1.55] text-ink-secondary">
                  Shown detached because the code they were written about has changed. Their
                  original context is quoted below — never dropped, never guessed back into place.
                </p>
                <div className="mt-3 space-y-3">
                  {outdated.map((p) => {
                    const hidden = p.thread.anchor.context.filter((s) => s === GAP).length;
                    return (
                      <article key={p.thread.threadId} data-testid={`outdated-${p.thread.threadId}`}>
                        <p className="font-mono text-[0.6875rem] tabular-nums text-ink-tertiary">
                          {p.thread.anchor.filePath}:{p.thread.anchor.line}
                        </p>
                        {/* GAP is a sentinel, not content, so it is dropped
                            here rather than printed — same as the app's own
                            OutdatedPanel. */}
                        <pre className="mt-1.5 overflow-x-auto rounded-[0.5rem] bg-void-surface p-2 font-mono text-[0.625rem] leading-[1.7] text-ink-secondary">
                          {p.thread.anchor.context.filter((s) => s !== GAP).join("\n")}
                        </pre>
                        {hidden > 0 && (
                          <p className="mt-1 text-[0.625rem] text-ink-tertiary">
                            {hidden} slot{hidden === 1 ? "" : "s"} the diff never exposed are
                            omitted from the quote.
                          </p>
                        )}
                        <p className="mt-1.5 text-[0.75rem] leading-snug text-ink-primary">
                          {p.thread.body}
                        </p>
                        <p className="text-[0.6875rem] text-ink-tertiary">{p.thread.nickname}</p>
                      </article>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <p className="text-[0.75rem] leading-[1.6] text-ink-tertiary">
            Edit any line in the diff and the verdicts recompute. There is no third outcome to
            reach for: a thread either follows its code or says out loud that it is outdated, and
            the one thing it may never do is quietly re-point at different code.
          </p>
        </div>
      </PgPanel>
    </PgShell>
  );
}

const ROW_TONE: Record<DiffLine["kind"], string> = {
  added: "bg-signal-green/[0.07]",
  removed: "bg-signal-red/[0.07]",
  context: "",
};

const ROW_SIGN: Record<DiffLine["kind"], string> = { added: "+", removed: "-", context: " " };

function DiffRow({
  line,
  path,
  threads,
  composerOpen,
  draft,
  onDraft,
  onOpenComposer,
  onCancelComposer,
  onSubmitComposer,
  onEdit,
}: {
  line: DiffLine;
  path: string;
  threads: PlacedThread[];
  composerOpen: boolean;
  draft: string;
  onDraft: (v: string) => void;
  onOpenComposer: (line: number) => void;
  onCancelComposer: () => void;
  onSubmitComposer: (line: number) => void;
  onEdit: (line: number, text: string, original: string) => void;
}) {
  // A removed line has no new-side position, so `toAnchorTarget` never emits
  // one and nothing can be anchored to it. Rendering it read-only is that
  // same fact, made visible.
  if (line.kind === "removed") {
    return (
      <div className={`flex items-center font-mono text-[0.6875rem] leading-[1.9] ${ROW_TONE.removed}`}>
        <span className="w-9 shrink-0 select-none pr-1.5 text-right tabular-nums text-ink-tertiary/60">
          {" "}
        </span>
        {/* Matches the comment button's footprint (w-4 + mr-1) so the sign
            column stays aligned with the editable rows above and below. */}
        <span className="w-5 shrink-0" />
        <span className="w-3 shrink-0 select-none text-center text-signal-red">-</span>
        <span className="whitespace-pre pr-3 text-ink-tertiary line-through decoration-1">
          {line.text}
        </span>
      </div>
    );
  }

  const n = line.newLine;
  return (
    <div>
      <div
        data-testid={`line-${path}-${n}`}
        className={`flex items-center font-mono text-[0.6875rem] leading-[1.9] ${ROW_TONE[line.kind]}`}
      >
        <span className="w-9 shrink-0 select-none pr-1.5 text-right tabular-nums text-ink-tertiary">
          {n}
        </span>
        {/* Compact gutter affordance. Below the 44 pt touch minimum, as a
            line gutter in a code view has to be — flagged rather than papered
            over, the way ui.tsx flags the same trade-off for its pills. */}
        <button
          type="button"
          onClick={() => onOpenComposer(n)}
          aria-label={`Comment on ${path} line ${n}`}
          className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.25rem] text-ink-tertiary/70 transition-colors duration-200 hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {/* A glyph, not a "+", so it can't be misread as the diff's own
              add marker one column to its right. */}
          <MessageSquarePlus size={11} strokeWidth={2} aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className={`w-3 shrink-0 select-none text-center ${
            line.kind === "added" ? "text-signal-green" : "text-ink-tertiary"
          }`}
        >
          {ROW_SIGN[line.kind]}
        </span>
        <input
          id={`ds-line-${path}-${n}`}
          name={`ds-line-${path}-${n}`}
          value={line.text}
          onChange={(e) => onEdit(n, e.target.value, line.text)}
          spellCheck={false}
          autoComplete="off"
          aria-label={`${path} line ${n}`}
          style={{ width: `${Math.max(30, line.text.length + 2)}ch` }}
          className="mr-3 rounded-[0.25rem] bg-transparent px-0.5 font-mono text-[0.6875rem] leading-[1.9] text-ink-primary transition-shadow duration-200 hover:ring-1 hover:ring-inset hover:ring-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
        />
      </div>

      {composerOpen && (
        <div className="border-y border-line-subtle bg-void-surface px-2.5 py-2">
          <label
            htmlFor={`ds-draft-${path}-${n}`}
            className="mb-1.5 block text-[0.6875rem] text-ink-tertiary"
          >
            Your comment on line {n}
          </label>
          <PgInput
            id={`ds-draft-${path}-${n}`}
            name={`ds-draft-${path}-${n}`}
            value={draft}
            autoComplete="off"
            onChange={(e) => onDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitComposer(n);
            }}
            placeholder="Anchored to this line…"
          />
          <div className="mt-2 flex gap-2">
            <PgButton onClick={() => onSubmitComposer(n)} disabled={draft.trim() === ""}>
              Comment
            </PgButton>
            <PgButton variant="ghost" onClick={onCancelComposer}>
              Cancel
            </PgButton>
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {threads.map((p) => (
          <motion.div
            key={p.thread.threadId}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.micro, ease: EASE }}
            data-testid={`thread-${p.thread.threadId}`}
            className="mx-2 my-1 rounded-[0.5rem] bg-void-surface p-2 ring-1 ring-inset ring-line-subtle"
          >
            <p className="text-[0.75rem] leading-snug text-ink-primary">{p.thread.body}</p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-tertiary">
              {p.thread.nickname}
              {p.placement.kind === "located" && p.placement.line !== p.thread.anchor.line && (
                <span className="font-mono tabular-nums text-signal-green">
                  {" "}
                  · followed its code from line {p.thread.anchor.line}
                </span>
              )}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
