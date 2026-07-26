"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgPanel, PgButton, PgTextarea, ScenarioBar, StatValue, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// This repo ("Saptavidhi") has no README; its chat-intent-analyzer purpose is
// inferred from filenames. This is a small, honest, rule-based re-creation:
// real keyword rules classify whatever message you type into one of five
// intents, with an "Uncategorized" fallback when nothing matches — genuinely
// computed client-side, not a canned per-scenario reply.
// ---------------------------------------------------------------------------

type Intent =
  | "Requesting more info"
  | "Expressing interest"
  | "Requesting photos"
  | "Declining / not interested"
  | "General greeting"
  | "Uncategorized";

interface ClassificationResult {
  intent: Intent;
  rationale: string;
  matchedTriggers: string[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const GREETING_FILLER = new Set([
  "hi", "hello", "hey", "namaste", "greetings", "there", "just", "wanted", "to", "say", "thanks",
  "thank", "you", "dear", "team",
]);

function isGreetingOnly(tokens: string[]): boolean {
  return tokens.filter((t) => !GREETING_FILLER.has(t)).length === 0;
}

const DECLINE_PHRASES = [
  "not interested", "not looking", "no thank", "not a match", "won't proceed", "will not proceed",
  "not proceeding", "pass on this", "have to pass", "not keen",
];
const DECLINE_WORDS = ["decline", "declining", "reject", "rejecting"];

const INFO_WORDS = [
  "family", "background", "details", "history", "occupation", "education", "horoscope", "kundli",
  "salary", "qualifications",
];
const INFO_PHRASES = ["more about", "know more", "tell me more", "more information", "more details"];

const PHOTO_WORDS = ["photo", "photos", "picture", "pictures", "pic", "pics", "image", "images"];

const INTEREST_WORDS = ["interested", "interest", "like", "proceed", "keen", "positive"];

const GREETING_WORDS = ["hi", "hello", "hey", "namaste", "greetings"];

function wordHits(normalized: string, words: string[]): string[] {
  return words.filter((w) => new RegExp(`\\b${w}\\b`).test(normalized));
}

function classifyIntent(message: string): ClassificationResult {
  const normalized = message.toLowerCase();
  const tokens = tokenize(message);

  // 1. Declining — checked first so "not interested" isn't mistaken for interest.
  const declinePhraseHit = DECLINE_PHRASES.find((p) => normalized.includes(p));
  const declineWordHits = wordHits(normalized, DECLINE_WORDS);
  const passHit = /\bpass\b/.test(normalized) ? "pass" : null;
  if (declinePhraseHit || declineWordHits.length > 0 || passHit) {
    const triggers = [declinePhraseHit, ...declineWordHits, passHit].filter((t): t is string => Boolean(t));
    return {
      intent: "Declining / not interested",
      rationale: `matched decline signal: "${triggers.join('", "')}"`,
      matchedTriggers: triggers,
    };
  }

  // 2. Requesting more info
  const infoWordHits = wordHits(normalized, INFO_WORDS);
  const infoPhraseHit = INFO_PHRASES.find((p) => normalized.includes(p));
  if (infoWordHits.length > 0 || infoPhraseHit) {
    const triggers = [...infoWordHits, ...(infoPhraseHit ? [infoPhraseHit] : [])];
    return {
      intent: "Requesting more info",
      rationale: `matched info-request keyword(s): "${triggers.join('", "')}"`,
      matchedTriggers: triggers,
    };
  }

  // 3. Requesting photos
  const photoHits = wordHits(normalized, PHOTO_WORDS);
  if (photoHits.length > 0) {
    return {
      intent: "Requesting photos",
      rationale: `matched keyword(s): "${photoHits.join('", "')}"`,
      matchedTriggers: photoHits,
    };
  }

  // 4. Expressing interest
  const interestHits = wordHits(normalized, INTEREST_WORDS);
  if (interestHits.length > 0) {
    return {
      intent: "Expressing interest",
      rationale: `matched keyword(s): "${interestHits.join('", "')}"`,
      matchedTriggers: interestHits,
    };
  }

  // 5. Greeting-only — a bare "hi"/"hello" with no other substantive content.
  const greetingHits = wordHits(normalized, GREETING_WORDS);
  if (greetingHits.length > 0 && isGreetingOnly(tokens)) {
    return {
      intent: "General greeting",
      rationale: `matched greeting word(s): "${greetingHits.join('", "')}" — no other substantive content detected`,
      matchedTriggers: greetingHits,
    };
  }

  return {
    intent: "Uncategorized",
    rationale: "no keyword rule matched this message — falling back honestly instead of guessing",
    matchedTriggers: [],
  };
}

function toneFor(intent: Intent): "cyan" | "green" | "amber" | "red" {
  switch (intent) {
    case "Requesting more info":
      return "cyan";
    case "Requesting photos":
      return "cyan";
    case "Expressing interest":
      return "green";
    case "Declining / not interested":
      return "red";
    default:
      return "amber";
  }
}

const DEFAULT_MESSAGE = "Hi, I'd like to know more about her family background";

export default function MatrimonyPlayground() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [result, setResult] = useState<ClassificationResult>(() => classifyIntent(DEFAULT_MESSAGE));
  const [runId, setRunId] = useState(0);

  function analyze(m: string = message) {
    setResult(classifyIntent(m));
    setRunId((id) => id + 1);
  }

  function scenario(m: string) {
    setMessage(m);
    analyze(m);
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        scenarios={[
          { label: "Requesting info", onClick: () => scenario("Could you share more details about her educational background and family?") },
          { label: "Expressing interest", onClick: () => scenario("We are very interested and would like to proceed with this match.") },
          { label: "Requesting photos", onClick: () => scenario("Could you please send a few more recent photos of her?") },
          { label: "Declining", onClick: () => scenario("Thank you, but we are not interested in taking this further.") },
        ]}
      />

      <PgPanel title="Visitor message">
        <PgTextarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message a prospective match's family might send…"
        />
        <div className="mt-3">
          <PgButton onClick={() => analyze()}>Analyze intent</PgButton>
        </div>
      </PgPanel>

      <PgPanel title="Detected intent">
        <AnimatePresence mode="wait">
          <motion.div
            key={runId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <StatValue label="intent" value={result.intent} tone={toneFor(result.intent)} />
            <div className="font-mono text-xs text-ink-secondary">{result.rationale}</div>
          </motion.div>
        </AnimatePresence>
      </PgPanel>

      <PgNote>
        This repo has no README — its scope (profile/preference/family admin tools plus this chat-intent analyzer
        for a matchmaking service called &quot;Saptavidhi&quot;) is inferred from filenames and source, not documented.
        Worth flagging directly: a real, possibly-live-looking Google API key was found commented out in
        app.py — worth rotating if it was ever a live credential, and adding a README before featuring this
        more prominently.
      </PgNote>
    </div>
  );
}
