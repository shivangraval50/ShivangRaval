"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgInput, PgSlider, ScenarioBar, StatValue, PgNote } from "./ui";

interface Passage {
  id: string;
  topic: string;
  text: string;
}

// A small, honestly-bundled corpus — 15 short passages this portfolio's own
// projects actually cover. Retrieval below runs a real token-overlap scorer
// against this corpus and the visitor's exact question; nothing here is a
// canned answer keyed to a specific question string.
const CORPUS: Passage[] = [
  {
    id: "stat-arb",
    topic: "Statistical arbitrage",
    text: "Statistical arbitrage strategies look for pairs or baskets of assets whose prices tend to move together over time. When the spread between them drifts unusually far from its historical average, a mean-reversion model bets on it snapping back. Kalman filters are a common tool for estimating that time-varying hedge ratio as market conditions change.",
  },
  {
    id: "order-books",
    topic: "Order books",
    text: "A limit order book records every resting buy and sell order for an instrument, sorted by price and then by arrival time, called price-time priority. A matching engine pairs incoming marketable orders against the best-priced resting orders until the order is filled or no more liquidity is available at an acceptable price. Order types like GTC, IOC, and FOK change how aggressively an order tries to fill before it rests or cancels.",
  },
  {
    id: "smart-order-routing",
    topic: "Smart order routing",
    text: "A smart order router splits or directs an order across multiple trading venues based on which venue currently offers the best combination of price, fees, latency, and available liquidity. Because venue conditions change continuously, routers track live per-venue statistics like fill rate and typical latency rather than relying on a static routing table. Routing quality is usually measured against a simple baseline, like round-robin, to show the actual lift from smarter decisions.",
  },
  {
    id: "market-sim",
    topic: "Market simulation",
    text: "A market simulator replays or generates order flow across multiple venues so trading strategies can be tested without risking real capital. Raw event-scheduling throughput, how fast the simulator can advance simulated time, is a different number from throughput once real order-matching logic runs on every event. The two numbers can differ by an order of magnitude or more, so it matters which one a benchmark actually reports.",
  },
  {
    id: "llm-inference",
    topic: "LLM inference serving",
    text: "Production LLM inference engines use techniques like continuous batching, paged key-value caches, quantization, and speculative decoding to serve more requests with less hardware. Continuous batching keeps a GPU busy by adding new requests into a running batch instead of waiting for the whole batch to finish. Paged KV-cache management borrows the idea of virtual-memory paging so the cache for many concurrent sequences doesn't need to sit in one contiguous block.",
  },
  {
    id: "quantization",
    topic: "Quantization and speculative decoding",
    text: "Quantization shrinks a model's weights to lower-precision numeric formats, trading a small amount of accuracy for less memory traffic and faster matrix multiplies, but the speedup depends on hardware having fast low-bit kernels, so a technique can even measure slower without that hardware to exploit. Speculative decoding uses a small draft model to propose several tokens ahead, then lets the large model verify them in a single pass, which can reduce the number of expensive full forward passes per generated token.",
  },
  {
    id: "distributed-training",
    topic: "Distributed training",
    text: "Distributed data-parallel (DDP) training keeps a copy of the model on every worker and averages gradients across workers after each backward pass, so every replica stays in sync. Fully-sharded data parallel (FSDP) goes further and shards the model parameters themselves across workers, trading extra communication for a much smaller per-device memory footprint. Tensor and pipeline parallelism split a single model's layers or matrix operations across devices instead of splitting the data.",
  },
  {
    id: "rag-pipelines",
    topic: "RAG pipelines",
    text: "Retrieval-augmented generation answers a question by first retrieving the most relevant passages from a document store, then conditioning a language model's generation on those passages instead of relying purely on what it memorized during training. FAISS and similar vector indexes make that retrieval step fast even over millions of documents by searching in embedding space rather than scanning raw text. A cross-encoder reranker can then re-score the top retrieved candidates more carefully, since it's too slow to run on the whole corpus but cheap enough to run on just the top results.",
  },
  {
    id: "rag-caching",
    topic: "Caching in RAG systems",
    text: "Caching repeat queries is one of the simplest ways to cut latency in a RAG system, since regenerating an answer to a question that's already been asked wastes both retrieval and generation time. A cache hit can return a stored answer in a few milliseconds, compared to the full retrieval-plus-generation path which typically takes over a second. The tradeoff is deciding how strictly two questions have to match to count as the same query.",
  },
  {
    id: "rlhf",
    topic: "RLHF and DPO",
    text: "Reinforcement learning from human feedback (RLHF) folds human preference judgments back into a model's ranking or generation behavior, typically by training a reward model on pairs of outputs humans have compared. That reward model then guides further optimization of the underlying model, or in lighter-weight setups, simply reranks candidate outputs before they're shown to a user. DPO, direct preference optimization, is a more recent alternative that skips training a separate reward model entirely.",
  },
  {
    id: "bpe-tokenizers",
    topic: "BPE tokenizers",
    text: "Byte-pair encoding (BPE) builds a vocabulary by starting from individual characters or bytes and repeatedly merging the most frequent adjacent pair into a new token, according to a fixed, ordered list of merge rules learned from training data. At inference time, encoding new text means applying those same merge rules in priority order until no more merges apply. This keeps common words compact as single tokens while rare or unseen words safely fall back to smaller character-level pieces.",
  },
  {
    id: "rl-agents",
    topic: "RL agents and PPO",
    text: "Proximal policy optimization (PPO) is a reinforcement learning algorithm that updates a policy's parameters in small, clipped steps so a single bad update can't collapse performance. In an entity-disambiguation setting, the reward signal doesn't have to be hand-labeled, it can come from a frozen pretrained encoder's similarity score between candidate entities. The resulting gains reflect how well the policy learns to exploit that similarity signal, not necessarily how good the encoder itself is.",
  },
  {
    id: "entity-resolution",
    topic: "Entity resolution",
    text: "Entity resolution matches records or mentions that refer to the same real-world thing even when they're phrased differently, such as equivalent job titles in different languages. A contrastive loss like InfoNCE trains an encoder so matching pairs end up close together in embedding space while non-matching pairs are pushed apart, which is what makes fast nearest-neighbor lookup with an index like FAISS meaningful afterward. A perfect precision score on every evaluation split is unusual enough that it's worth checking whether the eval set is too small before trusting it.",
  },
  {
    id: "streaming-pipelines",
    topic: "Streaming data pipelines",
    text: "A streaming data pipeline built on something like Kafka processes events continuously as they arrive rather than in scheduled batches, which keeps end-to-end latency low for time-sensitive data. Throughput for a single consumer instance is a concrete, directly measurable number, but throughput after adding more instances has to be measured too, it doesn't automatically scale linearly just because more instances were added. A load test is the only way to tell whether horizontal scaling actually happened versus being a projection.",
  },
  {
    id: "content-classifier",
    topic: "Content moderation classifiers",
    text: "A policy-driven content classifier turns a written moderation policy into positive and negative examples, embeds them with a sentence encoder, and flags new content by how similar its embedding is to the violation examples versus the compliant ones. Because the classifier works from embedding similarity rather than a fine-tuned decision boundary, updating the policy just means changing the example set instead of retraining a model.",
  },
];

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "and", "or",
  "for", "on", "with", "as", "that", "this", "it", "its", "be", "by", "from",
  "at", "into", "over", "so", "how", "what", "does", "do", "why", "when",
  "can", "you", "your", "i", "we", "than", "then", "which", "these", "those",
]);

function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return raw.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

const CORPUS_TOKEN_SETS: Set<string>[] = CORPUS.map((p) => new Set(tokenize(p.text)));

const DOC_FREQ = new Map<string, number>();
CORPUS_TOKEN_SETS.forEach((set) => {
  set.forEach((t) => DOC_FREQ.set(t, (DOC_FREQ.get(t) ?? 0) + 1));
});
const CORPUS_SIZE = CORPUS.length;

function idfOf(token: string): number {
  const df = DOC_FREQ.get(token) ?? 0;
  return Math.log((CORPUS_SIZE + 1) / (df + 1)) + 1;
}

interface Hit {
  passage: Passage;
  score: number;
}

// Real (if simple) IDF-weighted token-overlap retrieval: every question is
// genuinely re-tokenized and re-scored against the bundled corpus above.
function retrieve(question: string, topK: number): Hit[] {
  const qTokens = tokenize(question);
  if (qTokens.length === 0) return [];
  const scored: Hit[] = CORPUS.map((passage, i) => {
    const set = CORPUS_TOKEN_SETS[i];
    let score = 0;
    for (const t of qTokens) {
      if (set.has(t)) score += idfOf(t);
    }
    return { passage, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, topK);
}

function buildAnswer(hits: Hit[]): string {
  if (hits.length === 0) {
    return "No strong match found in the bundled corpus for this question — try asking about trading systems, order books, RAG, LLM inference, or distributed training.";
  }
  return hits[0].passage.text;
}

interface QueryResult {
  question: string;
  hits: Hit[];
  answer: string;
  latencyMs: number;
  cacheStatus: "hit" | "miss";
}

interface CacheEntry {
  hits: Hit[];
  answer: string;
  timestamp: number;
}

const SCENARIOS = [
  "How does a smart order router decide where to send an order?",
  "What is continuous batching in LLM inference?",
  "How does caching reduce latency in a RAG system?",
];

const MAX_TOP_K = 3;

export default function RagChatbotPlayground() {
  const [question, setQuestion] = useState(SCENARIOS[0]);
  const [topK, setTopK] = useState(2);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [lastUncachedMs, setLastUncachedMs] = useState<number | null>(null);
  const [lastCachedMs, setLastCachedMs] = useState<number | null>(null);
  const [runSeq, setRunSeq] = useState(0);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  async function runQuery(rawQuestion: string) {
    const q = rawQuestion.trim();
    const key = q.toLowerCase();
    if (!key) return;

    setRunning(true);
    const start = performance.now();
    try {
      const cached = cacheRef.current.get(key);
      if (cached) {
        const latency = performance.now() - start;
        setResult({ question: q, hits: cached.hits.slice(0, topK), answer: cached.answer, latencyMs: latency, cacheStatus: "hit" });
        setLastCachedMs(latency);
      } else {
        // Artificial delay standing in for real retrieval + generation latency,
        // so the cached-vs-uncached contrast is genuinely measurable, not just claimed.
        const delay = 300 + Math.random() * 500;
        await new Promise<void>((resolve) => setTimeout(resolve, delay));

        const hits = retrieve(q, MAX_TOP_K);
        const answer = buildAnswer(hits);
        const latency = performance.now() - start;

        cacheRef.current.set(key, { hits, answer, timestamp: Date.now() });
        setResult({ question: q, hits: hits.slice(0, topK), answer, latencyMs: latency, cacheStatus: "miss" });
        setLastUncachedMs(latency);
      }
    } finally {
      setRunning(false);
      setRunSeq((c) => c + 1);
    }
  }

  function run(preset: string) {
    setQuestion(preset);
    void runQuery(preset);
  }

  const speedup = lastUncachedMs !== null && lastCachedMs !== null && lastCachedMs > 0
    ? lastUncachedMs / lastCachedMs
    : null;

  return (
    <PgShell>
      <PgPanel title="Ask the bundled corpus">
        <div className="space-y-4">
          <PgInput
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runQuery(question);
            }}
            placeholder="e.g. What is continuous batching?"
          />
          <div className="flex flex-wrap items-center gap-2">
            <PgButton onClick={() => runQuery(question)} disabled={running}>
              {running ? "Retrieving…" : "Ask"}
            </PgButton>
          </div>

          <PgSlider
            label="Passages to retrieve (top K)"
            value={topK}
            min={1}
            max={3}
            step={1}
            onChange={setTopK}
          />

          <ScenarioBar scenarios={SCENARIOS.map((s) => ({ label: s, onClick: () => run(s) }))} />

          <PgNote>
            The corpus is 15 short passages bundled directly in this file. Retrieval genuinely
            tokenizes and IDF-weights your exact question against them each time — the
            &quot;answer&quot; below is extractive (it quotes the top-ranked passage), not a real
            LLM generation call. The 300–800ms delay on a new question stands in for real
            retrieval + generation latency; the cache hit and every timing shown are measured
            live with performance.now(), not hardcoded.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="Retrieved + answer">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatValue
            label="Latency"
            value={result ? `${result.latencyMs.toFixed(1)}ms` : "—"}
            tone={result?.cacheStatus === "hit" ? "green" : "cyan"}
          />
          <StatValue
            label="Cache"
            value={result ? (result.cacheStatus === "hit" ? "HIT" : "MISS") : "—"}
            tone={result?.cacheStatus === "hit" ? "green" : "amber"}
          />
          <StatValue label="Speedup" value={speedup ? `${speedup.toFixed(0)}×` : "—"} tone="cyan" />
          <StatValue label="Corpus size" value={`${CORPUS_SIZE} passages`} tone="cyan" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={runSeq}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 space-y-4 border-t border-line-subtle pt-4"
          >
            {result === null ? (
              <p className="font-mono text-xs text-ink-tertiary">Ask a question to retrieve from the corpus.</p>
            ) : (
              <>
                <div>
                  <div className="mb-1 font-mono text-[0.6471rem] uppercase tracking-wide text-ink-tertiary">
                    Extractive answer
                  </div>
                  <p className="text-sm leading-relaxed text-ink-primary">{result.answer}</p>
                </div>

                {result.hits.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-[0.6471rem] uppercase tracking-wide text-ink-tertiary">
                      Top {result.hits.length} retrieved passage{result.hits.length > 1 ? "s" : ""}
                    </div>
                    {result.hits.map((h) => (
                      <div key={h.passage.id} className="rounded-lg border border-line-subtle bg-void p-3">
                        <div className="mb-1 flex items-center justify-between font-mono text-[0.6471rem] text-signal-cyan">
                          <span>{h.passage.topic}</span>
                          <span className="text-ink-tertiary">score {h.score.toFixed(2)}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-ink-secondary">{h.passage.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </PgPanel>
    </PgShell>
  );
}
