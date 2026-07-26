"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgTextarea, ScenarioBar, StatValue, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// A small, honest, client-side stand-in for the real repo's approach: the
// real project embeds policy-derived examples with a multilingual sentence
// encoder and classifies by cosine-similarity margin. We don't ship an
// embedding model to the browser, so this scorer instead does keyword-overlap
// (stopword-filtered tokenization) plus a few hand-written heuristic signal
// words for the one documented failure mode (seniority misrepresentation).
// It is genuinely computed from whatever is typed into both boxes below.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "of", "to", "in", "on", "at", "for", "with",
  "by", "from", "is", "are", "was", "were", "be", "been", "being", "that", "this", "these", "those",
  "it", "its", "as", "which", "who", "whom", "will", "would", "should", "can", "could", "may",
  "might", "must", "shall", "do", "does", "did", "doing", "have", "has", "had", "having", "not",
  "no", "so", "such", "than", "too", "very", "just", "about", "into", "over", "under", "again",
  "further", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
  "few", "more", "most", "other", "some", "only", "own", "same", "he", "she", "they", "we", "you",
  "i", "him", "her", "them", "us", "my", "your", "his", "their", "our",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function keywordsOf(text: string): string[] {
  return tokenize(text).filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

// Hand-written heuristic signal words for the one documented case this repo's
// example covers: a policy about seniority, and content that mixes senior-tier
// and junior-tier language in a way that suggests misrepresentation.
const SENIOR_TERMS = [
  "senior", "sr", "vp", "vice president", "director", "chief", "head of", "lead", "principal",
  "staff", "executive",
];
const JUNIOR_TERMS = [
  "junior", "jr", "entry-level", "entry level", "intern", "internship", "associate", "trainee",
  "new-grad", "no experience", "0-1 years", "0-2 years",
];

interface ClassifierResult {
  margin: number;
  verdict: "FLAGGED" | "COMPLIANT";
  policyKeywords: string[];
  matchedKeywords: string[];
  overlapScore: number;
  heuristicTriggered: boolean;
  heuristicReason: string | null;
}

function classify(policy: string, content: string): ClassifierResult {
  const policyKeywords = Array.from(new Set(keywordsOf(policy)));
  const contentKeywordSet = new Set(keywordsOf(content));
  const matchedKeywords = policyKeywords.filter((k) => contentKeywordSet.has(k));
  const overlapScore = policyKeywords.length > 0 ? matchedKeywords.length / policyKeywords.length : 0;

  const normalizedPolicy = policy.toLowerCase();
  const normalizedContent = content.toLowerCase();
  const policyMentionsSeniority = /senior|seniority|title|rank|level|role/.test(normalizedPolicy);
  const seniorHit = SENIOR_TERMS.find((t) => normalizedContent.includes(t)) ?? null;
  const juniorHit = JUNIOR_TERMS.find((t) => normalizedContent.includes(t)) ?? null;
  const heuristicTriggered = Boolean(policyMentionsSeniority && seniorHit && juniorHit);
  const heuristicBump = heuristicTriggered ? 0.35 : 0;
  const heuristicReason = heuristicTriggered
    ? `policy concerns seniority, and content mixes senior-tier ("${seniorHit}") with junior-tier ("${juniorHit}") language`
    : null;

  const baseline = 0.3;
  const margin = Number((overlapScore * 0.55 + heuristicBump - baseline).toFixed(3));
  const verdict: "FLAGGED" | "COMPLIANT" = margin > 0 ? "FLAGGED" : "COMPLIANT";

  return { margin, verdict, policyKeywords, matchedKeywords, overlapScore, heuristicTriggered, heuristicReason };
}

const DEFAULT_POLICY = "Flag job postings that misrepresent seniority level";
const MISMATCH_CONTENT =
  "We're now accepting applications for job postings at the Senior Software Engineer level, though entry-level candidates with 0-1 years experience are welcome. This role reports directly to the VP of Engineering.";
const COMPLIANT_CONTENT =
  "Hiring a Senior Software Engineer with 6+ years of experience to lead our backend team. Reports to the Director of Engineering.";
const UNRELATED_CONTENT =
  "Our office now offers unlimited snacks, a rooftop lounge, and a new espresso machine for all employees.";

export default function PolicyClassifierPlayground() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [content, setContent] = useState(MISMATCH_CONTENT);
  const [result, setResult] = useState<ClassifierResult>(() => classify(DEFAULT_POLICY, MISMATCH_CONTENT));
  const [runId, setRunId] = useState(0);

  function run(p: string = policy, c: string = content) {
    setResult(classify(p, c));
    setRunId((id) => id + 1);
  }

  function useScenario(p: string, c: string) {
    setPolicy(p);
    setContent(c);
    run(p, c);
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        scenarios={[
          { label: "Documented case (seniority mismatch)", onClick: () => useScenario(DEFAULT_POLICY, MISMATCH_CONTENT) },
          { label: "Compliant posting", onClick: () => useScenario(DEFAULT_POLICY, COMPLIANT_CONTENT) },
          { label: "Unrelated content", onClick: () => useScenario(DEFAULT_POLICY, UNRELATED_CONTENT) },
        ]}
      />

      <PgShell>
        <PgPanel title="Policy (plain English)">
          <PgTextarea
            rows={3}
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            placeholder="Describe a moderation policy in plain English…"
          />
        </PgPanel>
        <PgPanel title="Content to check">
          <PgTextarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the content you want classified…"
          />
        </PgPanel>
      </PgShell>

      <PgButton onClick={() => run()}>Check content against policy</PgButton>

      <PgPanel title="Classification">
        <AnimatePresence mode="wait">
          <motion.div
            key={runId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-8">
              <StatValue
                label="similarity margin"
                value={(result.margin >= 0 ? "+" : "") + result.margin.toFixed(3)}
                tone={result.verdict === "FLAGGED" ? "red" : "green"}
              />
              <StatValue
                label="verdict"
                value={result.verdict}
                tone={result.verdict === "FLAGGED" ? "red" : "green"}
              />
            </div>
            <div className="space-y-1 font-mono text-xs text-ink-secondary">
              <div>
                policy keywords: {result.policyKeywords.length ? result.policyKeywords.join(", ") : "(none survived stopword filtering)"}
              </div>
              <div>
                matched in content: {result.matchedKeywords.length ? result.matchedKeywords.join(", ") : "none"} ({(result.overlapScore * 100).toFixed(0)}% of policy keywords)
              </div>
              {result.heuristicTriggered && (
                <div className="text-signal-amber">
                  heuristic signal (+0.35): {result.heuristicReason}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </PgPanel>

      <PgNote>
        The real repo reports a single worked example (similarity margin +0.142) and publishes no aggregate
        precision/recall benchmark. This playground&apos;s scorer — stopword-filtered keyword overlap plus a
        hand-written seniority-mismatch heuristic — is a simplified, illustrative stand-in for the real
        multilingual-embedding similarity approach, computed live from whatever you type above, not a
        reproduction of the original model.
      </PgNote>
    </div>
  );
}
