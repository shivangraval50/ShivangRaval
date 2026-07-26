"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgPanel, PgButton, PgInput, ScenarioBar, StatValue, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// The real deployed app's chat returns one hardcoded reply (a setTimeout mock)
// no matter what's typed. This playground is an honest improvement over
// that: a small bundled FAQ bank for a Northeastern MS CS advisor, matched
// against whatever you actually type via real keyword overlap (Dice
// coefficient) — with an honest fallback when nothing matches well, instead
// of forcing an answer.
// ---------------------------------------------------------------------------

interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_BANK: FaqEntry[] = [
  {
    question: "How should I plan my courses each semester?",
    keywords: ["course", "courses", "plan", "planning", "schedule", "semester", "credits", "classes"],
    answer:
      "Most MS CS students take two courses (8 credit hours) per fall/spring semester. Pair one heavier theory course (algorithms, systems) with one lighter or more practical elective each term, and avoid front-loading every hard class into your final semester before graduating or heading out on co-op.",
  },
  {
    question: "What electives should I take for the ML concentration?",
    keywords: ["ml", "machine", "learning", "concentration", "elective", "electives", "ai", "artificial", "intelligence", "deep", "neural"],
    answer:
      "Typical ML-concentration electives are Machine Learning, Foundations of Artificial Intelligence, Deep Learning/Neural Networks, Natural Language Processing, and Reinforcement Learning. Pick one or two aligned with where you want to land — research-leaning students should weight theory-heavy courses, industry-focused students should prioritize applied, project-based ones.",
  },
  {
    question: "Should I do the thesis or the non-thesis/project track?",
    keywords: ["thesis", "non-thesis", "project", "track", "research", "capstone"],
    answer:
      "Thesis track makes sense if you're aiming at a PhD or a research-scientist role and want a publishable body of work. The project/non-thesis track usually finishes faster and gives more flexibility to load up on electives — a better fit if you're optimizing for an industry software/ML engineering role.",
  },
  {
    question: "What's the typical timeline to graduate?",
    keywords: ["timeline", "long", "graduate", "duration", "years", "semesters", "finish", "complete"],
    answer:
      "Full-time, without a co-op, the MS CS program typically runs about 16-20 months (four semesters). Adding a standard six-month co-op stretches that to roughly two years. Part-time students more commonly finish in two to three years, depending on course load per term.",
  },
  {
    question: "When should I do a co-op or internship?",
    keywords: ["co-op", "coop", "internship", "intern", "timing", "apply"],
    answer:
      "Most students start their co-op search after completing two to three full-time semesters — enough core coursework to be credible in interviews. Co-ops typically start in the summer or the following fall and add about six months to your overall timeline, but they meaningfully strengthen your return-offer odds and resume.",
  },
  {
    question: "Is the MS CS program worth the cost? What's the ROI?",
    keywords: ["cost", "worth", "roi", "tuition", "price", "expensive", "value", "afford"],
    answer:
      "Weigh tuition against two things: the co-op earnings that partially offset it, and the salary jump a CS master's plus co-op experience tends to produce versus your pre-program baseline. Landing even one strong co-op usually changes the ROI math substantially compared to tuition paid without one.",
  },
  {
    question: "What programming languages should I know before starting?",
    keywords: ["language", "languages", "python", "java", "programming", "prerequisite", "prerequisites", "code", "coding"],
    answer:
      "Python covers the large majority of ML/AI electives. Java or C++ still shows up in systems-oriented courses. Realistically, being comfortable with data structures and algorithms matters more than any single language — most courses teach the language-specific parts you need.",
  },
  {
    question: "How many credits do I need to graduate?",
    keywords: ["credits", "credit", "hours", "requirement", "requirements", "total"],
    answer:
      "Most MS CS tracks require around 32 semester hours, split between core requirements, concentration electives, and a culminating experience (thesis, project, or a co-op-linked capstone) — check your specific catalog year, since requirements do shift.",
  },
  {
    question: "What are the core required courses?",
    keywords: ["core", "required", "requirement", "mandatory", "foundations"],
    answer:
      "Expect a foundational algorithms course plus one or two program-wide fundamentals requirements; the exact list depends on your concentration and catalog year, so cross-check your official degree audit rather than word-of-mouth.",
  },
  {
    question: "Can I switch concentrations later?",
    keywords: ["switch", "change", "concentration", "transfer", "different"],
    answer:
      "Generally yes, especially early on — before you've sunk too many electives into one specific concentration. Advisors typically recommend deciding by the end of your first semester so you don't lose credit toward the new concentration's requirements.",
  },
  {
    question: "How competitive is the co-op search?",
    keywords: ["competitive", "difficult", "hard", "co-op", "search", "find", "job", "market"],
    answer:
      "It varies by track and year, but treat it like any real job search: start early, apply broadly rather than to just a handful of dream companies, lean on Northeastern's co-op office and alumni network, and have one or two solid portfolio projects ready to talk through in interviews.",
  },
  {
    question: "What GPA do I need to maintain?",
    keywords: ["gpa", "grade", "grades", "minimum", "maintain", "standing"],
    answer:
      "Most graduate programs require at least a 3.0 to stay in good academic standing, though the exact matriculation requirement can vary by catalog year — check the official graduate student handbook rather than relying on hearsay.",
  },
];

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "of", "to", "in", "on", "at", "for", "with",
  "by", "from", "is", "are", "was", "were", "be", "been", "being", "that", "this", "these", "those",
  "it", "its", "as", "which", "who", "whom", "will", "would", "should", "can", "could", "may",
  "might", "must", "shall", "do", "does", "did", "doing", "have", "has", "had", "having", "not",
  "no", "so", "such", "than", "too", "very", "just", "about", "into", "over", "under", "again",
  "further", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
  "few", "more", "most", "other", "some", "only", "own", "same", "he", "she", "they", "we", "you",
  "i", "him", "her", "them", "us", "my", "your", "his", "their", "our", "what", "me",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function meaningfulTokens(text: string): string[] {
  return tokenize(text).filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface MatchResult {
  entry: FaqEntry | null;
  score: number;
  matchedKeywords: string[];
}

const MATCH_THRESHOLD = 0.15;

function findBestMatch(question: string): MatchResult {
  const tokens = new Set(meaningfulTokens(question));
  let best: FaqEntry | null = null;
  let bestScore = 0;
  let bestMatched: string[] = [];

  for (const entry of FAQ_BANK) {
    const matched = entry.keywords.filter((k) => tokens.has(k));
    const denom = entry.keywords.length + tokens.size;
    const dice = denom > 0 ? (2 * matched.length) / denom : 0;
    if (dice > bestScore) {
      bestScore = dice;
      best = entry;
      bestMatched = matched;
    }
  }

  const accepted = bestScore >= MATCH_THRESHOLD && bestMatched.length >= 1;
  return { entry: accepted ? best : null, score: bestScore, matchedKeywords: bestMatched };
}

const FALLBACK_MESSAGE =
  "I don't have a good answer for that yet — try asking about courses, electives, or timeline.";

export default function MastersCafePlayground() {
  const [question, setQuestion] = useState("What electives should I take for the ML concentration?");
  const [result, setResult] = useState<MatchResult>(() =>
    findBestMatch("What electives should I take for the ML concentration?")
  );
  const [runId, setRunId] = useState(0);

  function ask(q: string = question) {
    setResult(findBestMatch(q));
    setRunId((id) => id + 1);
  }

  function scenario(q: string) {
    setQuestion(q);
    ask(q);
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        scenarios={[
          { label: "Electives for ML concentration", onClick: () => scenario("What electives should I take for the ML concentration?") },
          { label: "Thesis vs. non-thesis", onClick: () => scenario("Should I do the thesis or the non-thesis track?") },
          { label: "When to do co-op", onClick: () => scenario("When should I do a co-op or internship?") },
        ]}
      />

      <PgPanel title="Ask the advisor">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <PgInput
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about courses, electives, thesis vs. project, timeline, co-op, cost…"
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
            />
          </div>
          <PgButton onClick={() => ask()}>Ask</PgButton>
        </div>
      </PgPanel>

      <PgPanel title="Advisor response">
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
                label="keyword match strength"
                value={`${Math.round(result.score * 100)}%`}
                tone={result.entry ? "green" : "amber"}
              />
              <StatValue label="matched entry" value={result.entry ? "found" : "none"} tone={result.entry ? "green" : "amber"} />
            </div>

            {result.entry ? (
              <div className="space-y-2">
                <div className="font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                  closest bank question: {result.entry.question}
                </div>
                <p className="font-mono text-sm leading-relaxed text-ink-primary">{result.entry.answer}</p>
                <div className="font-mono text-xs text-signal-cyan">
                  matched on: {result.matchedKeywords.join(", ")}
                </div>
              </div>
            ) : (
              <p className="font-mono text-sm leading-relaxed text-ink-secondary">{FALLBACK_MESSAGE}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </PgPanel>

      <PgNote>
        The currently deployed Master&apos;s Cafe returns one fixed reply via a setTimeout mock regardless of what
        you type — no model is wired up yet. This playground is a genuinely-matching demo (real keyword overlap
        against a bundled 12-question advisor FAQ bank, with an honest fallback when nothing matches) showing what
        the advisor experience should become.
      </PgNote>
    </div>
  );
}
