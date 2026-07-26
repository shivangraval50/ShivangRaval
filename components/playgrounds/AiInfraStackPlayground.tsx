"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScenarioBar, PgNote } from "./ui";

interface Module {
  id: string;
  name: string;
  oneLiner: string;
  detail: string;
  tech: string[];
}

// Real one-line descriptions of the three sibling repos this shell deploys —
// each has its own dedicated, genuinely-computed playground elsewhere on this
// page. There is nothing to simulate in this repo itself, so this component
// stays an honest directory rather than inventing a fake computation.
const MODULES: Module[] = [
  {
    id: "llm-policy-content-classifier",
    name: "Policy-Driven Content Classifier",
    oneLiner:
      "Turns a plain-English moderation policy into a zero-shot embedding-similarity classifier — no fine-tuning required.",
    detail:
      "Embeds policy-derived violation/compliant examples with a multilingual sentence encoder and classifies new content by similarity margin, so moderation rules can change without retraining a model.",
    tech: ["Gemini 1.5 Flash", "Sentence Embeddings", "FastAPI", "Gradio"],
  },
  {
    id: "agent-rl-benchmark-gym",
    name: "Agent RL Benchmark Gym",
    oneLiner:
      "A Gymnasium environment where a PPO agent learns entity disambiguation from a frozen encoder's similarity reward.",
    detail:
      "A custom Gymnasium environment where a PPO agent learns to disambiguate entity references, using cosine similarity from a frozen pretrained encoder as its reward signal — reaching ~57.6% accuracy vs. a 50% random baseline.",
    tech: ["Gymnasium", "Stable-Baselines3", "PPO"],
  },
  {
    id: "multilingual-entity-resolution",
    name: "Multilingual Entity Resolution",
    oneLiner:
      "Fine-tunes a multilingual encoder so equivalent job titles resolve to the same identity across languages.",
    detail:
      'Fine-tunes a multilingual sentence encoder with contrastive (InfoNCE) loss to match entities like "VP Sales Operations" across English, French, and German, indexed with FAISS for fast retrieval.',
    tech: ["Sentence Transformers", "FAISS", "InfoNCE Loss"],
  },
];

export default function AiInfraStackPlayground() {
  const [expanded, setExpanded] = useState<string | null>(MODULES[0].id);

  return (
    <div className="space-y-4">
      <ScenarioBar
        scenarios={MODULES.map((m) => ({
          label: m.name,
          onClick: () => setExpanded(m.id),
        }))}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((m) => {
          const isOpen = expanded === m.id;
          return (
            <div
              key={m.id}
              className="flex flex-col rounded-xl border border-line-subtle bg-void-elevated p-4"
            >
              <div className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                {m.name}
              </div>

              <p className="text-sm leading-relaxed text-ink-secondary">{m.oneLiner}</p>

              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : m.id)}
                className="mt-3 self-start font-mono text-[11px] uppercase tracking-wide text-signal-cyan transition-colors hover:opacity-80"
              >
                {isOpen ? "Hide detail −" : "Module detail +"}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 font-mono text-xs leading-relaxed text-ink-tertiary">
                      {m.detail}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-void-card px-2 py-0.5 text-[10px] text-ink-tertiary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-3 font-mono text-[11px] text-ink-tertiary">
                Its full interactive demo lives in this module&apos;s own project card on this
                page.
              </p>
            </div>
          );
        })}
      </div>

      <PgNote>
        This repo (ai-infra-stack) is the shared Next.js frontend shell only — it deploys and
        links the three modules above but contains no modeling or benchmark logic of its own, so
        there is genuinely nothing to compute here.
      </PgNote>
    </div>
  );
}
