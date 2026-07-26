"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgInput, ScenarioBar, StatValue, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// The real repo fine-tunes a multilingual sentence encoder (contrastive /
// InfoNCE loss) so equivalent job titles resolve to the same entity across
// English/French/German. Shipping that model to the browser isn't practical,
// so this is a small, honest, from-scratch stand-in: normalized token
// overlap + a hand-written job-title synonym/concept dictionary (so "VP" and
// "RevOps" can be recognized as related without a neural encoder) + a real
// Levenshtein edit-distance similarity, combined into one 0-1 score. It is
// genuinely computed from whatever you type into both boxes.
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

// Levenshtein edit distance, single-row DP (O(mn) time, O(n) space).
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

// A small hand-written dictionary mapping raw tokens (English, plus a few
// French/German equivalents, in the spirit of the real project's cross-
// language goal) to role "concepts". Tokens tagged "qualifier:*" are
// distinguishing modifiers — if only one title has one, that's a signal the
// two roles are meaningfully different, not just a naming difference.
const TOKEN_CONCEPTS: Record<string, string[]> = {
  vp: ["leadership"], svp: ["leadership"], evp: ["leadership"], vice: ["leadership"],
  president: ["leadership"], chief: ["leadership"], director: ["leadership"],
  directeur: ["leadership"], directrice: ["leadership"], direktor: ["leadership"],
  leiter: ["leadership"], leiterin: ["leadership"],
  head: ["leadership"], principal: ["leadership"], lead: ["leadership", "management"],
  senior: ["seniority", "qualifier:senior"], sr: ["seniority", "qualifier:senior"],
  junior: ["seniority", "qualifier:junior"], jr: ["seniority", "qualifier:junior"],
  manager: ["management"], mgr: ["management"], management: ["management"], supervisor: ["management"],
  responsable: ["management"], gestionnaire: ["management"],
  operations: ["operations"], ops: ["operations"], revops: ["operations", "sales"], logistics: ["operations"],
  sales: ["sales"], revenue: ["sales"], business: ["sales"], account: ["sales"],
  ventes: ["sales"], commercial: ["sales"], vertrieb: ["sales"], verkauf: ["sales"],
  marketing: ["marketing"], brand: ["marketing"], growth: ["marketing", "sales"],
  product: ["product", "qualifier:product"], produit: ["product", "qualifier:product"],
  produkt: ["product", "qualifier:product"],
  engineering: ["engineering"], engineer: ["engineering"], developer: ["engineering"], software: ["engineering"],
  technical: ["engineering"], technique: ["engineering"], technik: ["engineering"],
  ingenieur: ["engineering"], "ingénieur": ["engineering"], "ingénieure": ["engineering"],
  hr: ["people"], human: ["people"], resources: ["people"], people: ["people"], talent: ["people"],
  ressources: ["people"], humaines: ["people"], personal: ["people"],
  finance: ["finance"], financial: ["finance"], accounting: ["finance"],
  customer: ["support"], support: ["support"], success: ["support"], service: ["support"],
  regional: ["qualifier:regional"], "régional": ["qualifier:regional"], national: ["qualifier:regional"],
  global: ["qualifier:global"], international: ["qualifier:global"],
  assistant: ["qualifier:assistant"], adjoint: ["qualifier:assistant"],
  associate: ["qualifier:associate"], "associé": ["qualifier:associate"],
  deputy: ["qualifier:deputy"], interim: ["qualifier:interim"], acting: ["qualifier:interim"],
  digital: ["qualifier:digital"], "numérique": ["qualifier:digital"], creative: ["qualifier:creative"],
};

function conceptsOf(tokens: string[]): Set<string> {
  const out = new Set<string>();
  for (const t of tokens) {
    const concepts = TOKEN_CONCEPTS[t];
    if (concepts) concepts.forEach((c) => out.add(c));
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

// Overlap coefficient (intersection / smaller set size) rather than Jaccard,
// deliberately: concept sets are tiny, and we want the scorer to be generous
// when one title's concepts are basically a subset of the other's.
function overlapCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / Math.min(a.size, b.size);
}

type Verdict = "MATCH" | "PARTIAL MATCH" | "NO MATCH";

interface ResolutionResult {
  final: number;
  verdict: Verdict;
  literalOverlap: number;
  conceptOverlap: number;
  editSim: number;
  qualifierPenalty: number;
}

function resolve(titleA: string, titleB: string): ResolutionResult {
  const normA = normalize(titleA);
  const normB = normalize(titleB);
  const tokensA = tokenize(titleA);
  const tokensB = tokenize(titleB);

  const literalOverlap = jaccard(new Set(tokensA), new Set(tokensB));

  const conceptsA = conceptsOf(tokensA);
  const conceptsB = conceptsOf(tokensB);
  const conceptOverlap = overlapCoefficient(conceptsA, conceptsB);

  const maxLen = Math.max(normA.length, normB.length, 1);
  const dist = levenshtein(normA, normB);
  const editSim = 1 - dist / maxLen;

  let hasAsymmetricQualifier = false;
  for (const c of conceptsA) if (c.startsWith("qualifier:") && !conceptsB.has(c)) hasAsymmetricQualifier = true;
  for (const c of conceptsB) if (c.startsWith("qualifier:") && !conceptsA.has(c)) hasAsymmetricQualifier = true;
  const qualifierPenalty = hasAsymmetricQualifier ? 0.55 : 0;

  const raw = 0.1 * literalOverlap + 0.6 * conceptOverlap + 0.2 * editSim - qualifierPenalty;
  const final = Math.max(0, Math.min(1, raw));
  const verdict: Verdict = final >= 0.62 ? "MATCH" : final >= 0.34 ? "PARTIAL MATCH" : "NO MATCH";

  return { final, verdict, literalOverlap, conceptOverlap, editSim, qualifierPenalty };
}

const DEFAULT_A = "Senior Software Engineer";
const DEFAULT_B = "Sr. Software Engineer";
const EASY_A = "VP Sales Operations";
const EASY_B = "RevOps Manager";
const HARD_A = "Marketing Manager";
const HARD_B = "Product Marketing Manager";

function toneFor(v: Verdict): "green" | "amber" | "red" {
  return v === "MATCH" ? "green" : v === "PARTIAL MATCH" ? "amber" : "red";
}

export default function EntityResolutionPlayground() {
  const [titleA, setTitleA] = useState(DEFAULT_A);
  const [titleB, setTitleB] = useState(DEFAULT_B);
  const [result, setResult] = useState<ResolutionResult>(() => resolve(DEFAULT_A, DEFAULT_B));
  const [runId, setRunId] = useState(0);

  function run(a: string = titleA, b: string = titleB) {
    setResult(resolve(a, b));
    setRunId((id) => id + 1);
  }

  function scenario(a: string, b: string) {
    setTitleA(a);
    setTitleB(b);
    run(a, b);
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        scenarios={[
          { label: "Easy match: VP Sales Ops vs RevOps Mgr", onClick: () => scenario(EASY_A, EASY_B) },
          { label: "Hard / adversarial pair", onClick: () => scenario(HARD_A, HARD_B) },
          { label: "Reset to default", onClick: () => scenario(DEFAULT_A, DEFAULT_B) },
        ]}
      />

      <PgShell>
        <PgPanel title="Job title A">
          <PgInput value={titleA} onChange={(e) => setTitleA(e.target.value)} placeholder="e.g. VP Sales Operations" />
        </PgPanel>
        <PgPanel title="Job title B">
          <PgInput value={titleB} onChange={(e) => setTitleB(e.target.value)} placeholder="e.g. RevOps Manager" />
        </PgPanel>
      </PgShell>

      <PgButton onClick={() => run()}>Resolve entities</PgButton>

      <PgPanel title="Resolution">
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
              <StatValue label="resolution score" value={result.final.toFixed(3)} tone={toneFor(result.verdict)} />
              <StatValue label="verdict" value={result.verdict} tone={toneFor(result.verdict)} />
            </div>
            <div className="space-y-1 font-mono text-xs text-ink-secondary">
              <div>token overlap (Jaccard): {result.literalOverlap.toFixed(3)}</div>
              <div>concept/synonym overlap: {result.conceptOverlap.toFixed(3)}</div>
              <div>edit-distance similarity: {result.editSim.toFixed(3)}</div>
              {result.qualifierPenalty > 0 && (
                <div className="text-signal-amber">
                  distinguishing-qualifier penalty: -{result.qualifierPenalty.toFixed(2)} (one title carries a modifier —
                  e.g. &quot;product&quot;, &quot;senior&quot; — that the other lacks)
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </PgPanel>

      <PgNote>
        The real fine-tuned encoder reported a perfect 1.0 (precision@1 and MRR) across every split it was tested
        on, including an external ESCO benchmark — a result more likely to indicate eval-set leakage than genuine
        generalization; a model that scores 1.0 on everything hasn&apos;t proven it can discriminate. This simplified
        demo (token overlap + a small hand-written synonym dictionary + real edit distance) is deliberately less
        confident — try the &quot;Hard / adversarial pair&quot; scenario above to see it correctly say NO MATCH on two
        textually-similar titles, instead of calling everything a match.
      </PgNote>
    </div>
  );
}
