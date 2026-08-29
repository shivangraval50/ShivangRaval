"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgSlider, ScenarioBar, PgNote, StatValue } from "./ui";
import { DUR, EASE } from "@/lib/motion";

/* ===========================================================================
 * PORTED LOGIC — a copy of rag-console's real code, not a reimplementation.
 *
 * `decideRetrieval`, `rankByScore` and the `RetrievalPolicy` constructor below
 * are a faithful hand-copy of rag-console's `packages/core`, so the verdict
 * this playground shows is reached by the project's own function rather than
 * by a script that already knows the answer:
 *
 *   RetrievalPolicy, retrievalPolicy, Retrieval, decideRetrieval, refusalMessage
 *      https://github.com/shivangraval50/rag-console/blob/main/packages/core/src/retrieval.ts
 *   rankByScore
 *      https://github.com/shivangraval50/rag-console/blob/main/packages/core/src/score.ts
 *   DEFAULT_POLICY, POLICY_VERSION
 *      https://github.com/shivangraval50/rag-console/blob/main/packages/core/src/policy.ts
 *
 * A copy, not an import — the portfolio takes no dependency on rag-console —
 * so if the upstream rules change, this block must be updated by hand.
 * `packages/core` is portable at all only because it is pure: zero I/O, zero
 * platform imports, zero clock reads. That purity is the same property that
 * lets the real project property-test it without a database.
 * =========================================================================== */

/** The calibrated defaults, fitted against a labelled query set. Editing one
 *  upstream without re-running the sweep fails a test there; here they are
 *  the slider's starting position. */
export const DEFAULT_POLICY = {
  topK: 5,
  nearMissK: 5,
  minTopScore: 0.563,
  minMarginOverMean: 0.025,
} as const;

interface RetrievalPolicy {
  readonly topK: number;
  readonly nearMissK: number;
  /** Absolute floor the best chunk's cosine must clear. */
  readonly minTopScore: number;
  /** Relative floor: how far the best chunk must stand above the mean of the
   *  rest of the candidate window. Catches a query that matched everything
   *  equally, which an absolute floor alone cannot see. */
  readonly minMarginOverMean: number;
}

interface Candidate {
  chunkId: string;
  score: number;
  repo: string;
  path: string;
  text: string;
}

type Retrieval =
  | { kind: "answerable"; selected: Candidate[]; nearMisses: Candidate[]; topScore: number; margin: number }
  | { kind: "insufficient"; nearMisses: Candidate[]; topScore: number; margin: number }
  | { kind: "empty" };

/** Ranks its own input rather than trusting the caller to have done it: three
 *  call sites feed the real one, and one of them getting the order wrong would
 *  silently change which chunks are cited. */
function rankByScore(scored: readonly Candidate[]): Candidate[] {
  return [...scored].sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId));
}

/**
 * The whole decision, as one pure function of the candidates and the policy.
 * There is no threshold constant buried anywhere else in the pipeline, which
 * is what makes every refusal reproducible from its inputs alone.
 */
/* Exported, though the component is the only consumer, so the ported rules can
 * be checked against the fixtures without a browser:
 *   npx tsx -e 'import {decideRetrieval,QUERIES,DEFAULT_POLICY} from
 *     "./components/playgrounds/RagConsolePlayground"; ...'
 * All four questions classify the way the calibration set labels them, and
 * raising the floor to 0.900 flips a covered one to a refusal -- which is the
 * claim the note at the bottom of this playground makes. */
export function decideRetrieval(scored: readonly Candidate[], policy: RetrievalPolicy): Retrieval {
  const ranked = rankByScore(scored);
  if (ranked.length === 0) return { kind: "empty" };

  const top = ranked[0]!;
  const rest = ranked.slice(1);
  const mean = rest.length === 0 ? 0 : rest.reduce((n, c) => n + c.score, 0) / rest.length;
  const margin = top.score - mean;

  const nearMisses = ranked.slice(0, policy.nearMissK);
  if (top.score < policy.minTopScore || margin < policy.minMarginOverMean) {
    return { kind: "insufficient", nearMisses, topScore: top.score, margin };
  }
  return {
    kind: "answerable",
    selected: ranked.slice(0, policy.topK),
    nearMisses: ranked.slice(policy.topK, policy.topK + policy.nearMissK),
    topScore: top.score,
    margin,
  };
}

function refusalMessage(topScore: number, margin: number, policy: RetrievalPolicy): string {
  return (
    `The corpus does not cover this question. The best passage scored ${topScore.toFixed(3)} ` +
    `against a floor of ${policy.minTopScore.toFixed(3)}, and stood ${margin.toFixed(3)} above ` +
    `the mean of the other candidates against a required margin of ` +
    `${policy.minMarginOverMean.toFixed(3)}. The closest passages are listed below so you can ` +
    `judge the retrieval yourself.`
  );
}

/* ===========================================================================
 * FIXTURES — real, not invented.
 *
 * Four queries from rag-console's labelled calibration set, with the top ten
 * chunks each retrieves and the cosine similarity each scored, exported from
 * the real 1,117-chunk committed snapshot. The scores were computed by the
 * project's own embeddings; nothing here is embedded in the browser.
 *
 * What that means for what you are looking at: the RETRIEVAL is a recording,
 * the DECISION is live. Move the threshold and `decideRetrieval` above runs
 * again over these real scores.
 * =========================================================================== */

interface FixtureQuery {
  id: string;
  text: string;
  label: "answerable" | "unanswerable";
  candidates: Candidate[];
}

export const QUERIES: FixtureQuery[] = [
  {
    id: "a-diffsync-outdated",
    text: "What happens to a diffsync comment thread when the line it's anchored to gets changed or deleted?",
    label: "answerable",
    candidates: [
      {
        chunkId: "diffsync/README.md#0",
        score: 0.804501,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "# diffsync Several reviewers on one pull request at once \u2014 live presence, threaded comments anchored to lines of the diff, and an optional AI reading-order pass. Comments are anchored to lines, and lines move, so a thread either follows its code or says out lo",
      },
      {
        chunkId: "diffsync/docs/superpowers/specs/2026-08-27-diffsync-design.md#1",
        score: 0.729168,
        repo: "shivangraval50/diffsync",
        path: "docs/superpowers/specs/2026-08-27-diffsync-design.md",
        text: "editing. ## The hard part Not the real-time layer \u2014 `openbid` already proved that, and comments are append-only, so the Durable Object provides ordering and there is no conflict resolution to do. The hard part is that **a comment is anchored to a line, and lin",
      },
      {
        chunkId: "diffsync/README.md#5",
        score: 0.705891,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "ad's position on every render from its original anchor and the current revision's targets, so a thread can never be displayed at a position that was true for a revision the reader is not looking at. **`AnchorTarget` is deliberately sparse.** It is a `Map<numbe",
      },
      {
        chunkId: "diffsync/README.md#4",
        score: 0.685996,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "e pull-request key \u2014 base64url of `<nonce>/gh/<owner>/<repo>/<number>` or `<nonce>/fx/<slug>/<revision>` \u2014 *is* the object's name, so two different pull requests cannot collide onto one comment log. **The log is append-only and the state is a pure fold.** Even",
      },
      {
        chunkId: "diffsync/README.md#1",
        score: 0.667125,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: ": a thread that quietly re-points at different code, so two reviewers end up arguing about code nobody wrote, each convinced the other is reading the diff wrong. Nothing in the UI would look broken. So relocation is a total, pure function with exactly two outc",
      },
      {
        chunkId: "diffsync/README.md#8",
        score: 0.645746,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "dated`; - a sub-threshold sparse window is `outdated` **even when an identical one exists elsewhere** \u2014 this is the regression guard for rule 5, and it goes red immediately if rule 5 is removed. Two properties assert behaviour that is *not* ideal, on purpose, ",
      },
      {
        chunkId: "diffsync/README.md#2",
        score: 0.628905,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "the diff does not expose holds a sentinel rather than being dropped, so the window is always exactly seven entries wide. `relocate` applies five rules, in order (`packages/anchor/src/relocate.ts`): 1. **Path mismatch \u2192 `outdated`.** Renames are not followed; f",
      },
      {
        chunkId: "diffsync/README.md#9",
        score: 0.62472,
        repo: "shivangraval50/diffsync",
        path: "README.md",
        text: "ear at line 18 having been written at line 15 \u2014 asserted by its position in the diff, since a thread rendered at its old line number would pass a \"still visible\" check while pointing at different code. The other must appear detached in the outdated panel, name",
      },
      {
        chunkId: "diffsync/docs/superpowers/specs/2026-08-27-diffsync-design.md#0",
        score: 0.619091,
        repo: "shivangraval50/diffsync",
        path: "docs/superpowers/specs/2026-08-27-diffsync-design.md",
        text: "# diffsync \u2014 design **Status:** approved 2026-08-27 **Program context:** Project 2 of 3 in a front-end-forward portfolio program (`openbid`, then `diffsync`, then `rag-console`). ## Why this exists Of 22 public repos, 19 are Python/C++/OCaml systems work. `ope",
      },
      {
        chunkId: "openbid/README.md#7",
        score: 0.603202,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "c/index.ts`](packages/store/src/index.ts). - **Reconnect** sends `{ t: \"hello\", lastSeenSeq }` and the DO replays exactly the gap \u2014 or sends a fresh snapshot instead if you are more than 500 events behind. Backoff is `min(30s, 500ms \u00b7 2^attempt)`. - **The cloc",
      },
    ],
  },
  {
    id: "a-openbid-conflict",
    text: "How does openbid decide who wins when two people bid on the same lot at the same instant?",
    label: "answerable",
    candidates: [
      {
        chunkId: "openbid/README.md#1",
        score: 0.736356,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "can settle \u2014 someone has to be first, and everyone has to agree who. openbid puts one Durable Object in charge of each room, and gets the ordering from where the code runs rather than from a lock: - A Durable Object is a **single instance with a single thread*",
      },
      {
        chunkId: "openbid/README.md#0",
        score: 0.722658,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "# openbid A live multi-user auction where the server is the only authority on price. Many browsers bid on the same lot over WebSockets; one Cloudflare Durable Object per room decides every bid, and clients reconcile their optimistic guesses against what it say",
      },
      {
        chunkId: "openbid/docs/superpowers/plans/2026-08-26-openbid.md#145",
        score: 0.68768,
        repo: "shivangraval50/openbid",
        path: "docs/superpowers/plans/2026-08-26-openbid.md",
        text: "t grace.getByLabel(/your bid/i).fill(amount); await Promise.all([ ada.getByRole(\"button\", { name: /place bid/i }).click(), grace.getByRole(\"button\", { name: /place bid/i }).click(), ]); // Exactly one of them must see a rejection; the DO serialises the pair. c",
      },
      {
        chunkId: "openbid/README.md#15",
        score: 0.683027,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "have passed while a real bug was live: the DO acked before broadcasting, the store advanced `lastSeenSeq` on the ack, and the winner's own client then discarded its own winning delta as a duplicate. Being straight about what it does *not* prove: the harness ca",
      },
      {
        chunkId: "openbid/README.md#10",
        score: 0.672809,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "decrements it. That is correct for an English auction \u2014 you pay only if you win, so there is nothing to deduct while bidding \u2014 and it is why the property test asserts that no *accepted bid* ever exceeds the starting budget, rather than asserting something vacu",
      },
      {
        chunkId: "openbid/README.md#14",
        score: 0.66807,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "s \u2014 separate cookie jars, so two genuinely distinct bidders \u2014 against a real `wrangler dev` Worker, and clicks both \"place bid\" buttons for the **same amount** in one `Promise.all`. It then asserts: 1. Exactly one of the two shows the server's own rejection co",
      },
      {
        chunkId: "openbid/README.md#5",
        score: 0.657134,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "takes a token from that connection's rate-limit bucket (10 per 10s, stored in the socket's serialized attachment so it survives hibernation), then calls `validateBid(state, cmd)`. That returns *either* a rejection reason *or* an event \u2014 it never mutates anythi",
      },
      {
        chunkId: "openbid/docs/superpowers/plans/2026-08-26-openbid.md#160",
        score: 0.656464,
        repo: "shivangraval50/openbid",
        path: "docs/superpowers/plans/2026-08-26-openbid.md",
        text: "io repo. In `~/Downloads/portfolio-site/portfolio-site/src/App.tsx`, add an entry to the `SELECTED_WORK` array (it is an array of `{title, blurb, stack, href}`, so this needs no structural change): ```tsx { title: \"openbid \u2014 live multi-user auction\", blurb: \"A",
      },
      {
        chunkId: "openbid/docs/superpowers/plans/2026-08-26-openbid.md#0",
        score: 0.651333,
        repo: "shivangraval50/openbid",
        path: "docs/superpowers/plans/2026-08-26-openbid.md",
        text: "# openbid Implementation Plan > **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Goal:",
      },
      {
        chunkId: "openbid/README.md#18",
        score: 0.650017,
        repo: "shivangraval50/openbid",
        path: "README.md",
        text: "e` sitting next to it \u2014 but a hand-crafted `hello` can still claim to be a signed-in identity. Closing that properly needs the web app to mint a short-lived signed handshake token that the Worker verifies against a shared secret; that is a new deploy credentia",
      },
    ],
  },
  {
    id: "u-tax",
    text: "What is the standard deduction for a single filer in the 2025 tax year?",
    label: "unanswerable",
    candidates: [
      {
        chunkId: "distributed-training-lab/train_fsdp.py#8",
        score: 0.54318,
        repo: "shivangraval50/distributed-training-lab",
        path: "train_fsdp.py",
        text: "at([t.float().sum().reshape(1) for t in full_state.values()]) return fp, full_state @dataclass class StepRecord: step: int loss: float step_time_s: float tokens_per_sec: float @dataclass class RunResult: rank: int world_size: int device: str full_params: int l",
      },
      {
        chunkId: "masters-cafe/lib/calculations.ts#1",
        score: 0.542965,
        repo: "shivangraval50/masters-cafe",
        path: "lib/calculations.ts",
        text: "onst years = 10 const totalWithInterest = loanAmount * Math.pow(1 + funding.interest_rate, years) totalCost += (totalWithInterest - loanAmount) } // Get expected salary for target role const roleData = roiData.salary_data_neu_alumni.roles[targetRole as keyof t",
      },
      {
        chunkId: "stat-arb-strategy/README.md#3",
        score: 0.538778,
        repo: "shivangraval50/stat-arb-strategy",
        path: "README.md",
        text: "ustness ## \ud83e\uddea Testing ```bash # Test individual components ./venv/bin/python features/feature_engineering.py # Run full backtest ./venv/bin/python backtest_optimized.py ``` ## \ud83d\udcca Expected Results On production data with realistic costs: - **Sharpe Ratio**: 1.4",
      },
      {
        chunkId: "stat-arb-strategy/backtest_conservative.py#4",
        score: 0.537572,
        repo: "shivangraval50/stat-arb-strategy",
        path: "backtest_conservative.py",
        text: "print(f\" \u2705 Sharpe ratio: {sharpe_ratio:.2f} (professional range) \u2705\") elif sharpe_ratio > 2.5: print(f\" \ud83c\udfc6 Sharpe ratio: {sharpe_ratio:.2f} (exceptional!) \") baseline_dd = -0.30 dd_reduction = (1 - abs(max_drawdown) / abs(baseline_dd)) * 100 print(f\" \u2705 Drawdown",
      },
      {
        chunkId: "masters-cafe/lib/calculations.ts#2",
        score: 0.531176,
        repo: "shivangraval50/masters-cafe",
        path: "lib/calculations.ts",
        text: "livingCost: Math.round(livingCost), opportunityCost: Math.round(opportunityCost), expectedSalary: Math.round(expectedSalary), currentSalary, salaryBoost: Math.round(salaryBoost), breakEven, npv10: Math.round(npv10), worthIt: npv10 > 0, programYears, isAlign: !",
      },
      {
        chunkId: "distributed-training-lab/train_fsdp.py#17",
        score: 0.528588,
        repo: "shivangraval50/distributed-training-lab",
        path: "train_fsdp.py",
        text: "ss), nccl=CUDA (Kaggle scaling)\", ) p.add_argument( \"--sharding-strategy\", type=str, default=\"FULL_SHARD\", choices=[\"FULL_SHARD\", \"SHARD_GRAD_OP\", \"NO_SHARD\"], help=\"FULL_SHARD=ZeRO-3-like (params+grads+optim state sharded, default); \" \"SHARD_GRAD_OP=ZeRO-2-li",
      },
      {
        chunkId: "stat-arb-strategy/backtest_optimized.py#5",
        score: 0.527603,
        repo: "shivangraval50/stat-arb-strategy",
        path: "backtest_optimized.py",
        text: "} with open(\"results/final_results.json\", 'w') as f: json.dump(final_results, f, indent=2) print(f\"\\n\u2713 Results saved to results/final_results.json\") return sharpe if __name__ == \"__main__\": os.makedirs(\"results\", exist_ok=True) sharpe = main() if 1.4 <= sharpe",
      },
      {
        chunkId: "distributed-training-lab/train_tp.py#6",
        score: 0.525653,
        repo: "shivangraval50/distributed-training-lab",
        path: "train_tp.py",
        text: "l_total += p.numel() # DTensor.numel() reports the GLOBAL logical size else: local_total += p.numel() global_total += p.numel() return local_total, global_total def full_params_fingerprint(tp_model: TPTinyGPT) -> tuple[torch.Tensor, dict[str, torch.Tensor]]: \"",
      },
      {
        chunkId: "TravelAiAgent/fast.py#5",
        score: 0.523559,
        repo: "shivangraval50/TravelAiAgent",
        path: "fast.py",
        text: "\"Special_Considerations\": None } activities = re.findall(r'\\* \\*\\*([\\w\\s]+):\\*\\* (.*?)(?=\\n|$)', section, re.DOTALL) if not activities: activities = re.findall(r'\\*\\*([\\w\\s]+):\\*\\* (.*?)(?=\\n(?:\\*|$)|$)', section, re.DOTALL) for time, activity in activities: c",
      },
      {
        chunkId: "TravelAiAgent/test.py#13",
        score: 0.522245,
        repo: "shivangraval50/TravelAiAgent",
        path: "test.py",
        text: "and \"Transportation_Recommendations\" in special_sections.get(current_day, {}): special_sections[current_day][\"Transportation_Recommendations\"].append({\"mode\": line.split(\" \", 1)[1]}) elif line.startswith(\"Budget Allocation Recommendations\"): special_sections[c",
      },
    ],
  },
  {
    id: "u-music",
    text: "What tuning did Joni Mitchell use on Blue, and why?",
    label: "unanswerable",
    candidates: [
      {
        chunkId: "stat-arb-strategy/backtest.py#4",
        score: 0.508732,
        repo: "shivangraval50/stat-arb-strategy",
        path: "backtest.py",
        text: "{sharpe:.2f} (target: 1.4-1.6) \u2705\") elif sharpe >= 1.0: print(f\" \u2713 Sharpe ratio: {sharpe:.2f} (good performance)\") print(f\" \ud83d\udca1 Tune parameters to reach 1.4-1.6 target\") else: print(f\" \ud83d\udcca Sharpe ratio: {sharpe:.2f}\") print(f\" \ud83d\udca1 Strategy needs optimization\") if ",
      },
      {
        chunkId: "distributed-ml-training/README.md#4",
        score: 0.497182,
        repo: "shivangraval50/distributed-ml-training",
        path: "README.md",
        text: "ers) - Hyperparameter tuning (100+ experiments) - Research workflows - Production ML pipelines ## \ud83d\udcca MLflow Integration Track 100+ experiments: ```bash mlflow ui # Visit: http://localhost:5000 ``` ## \ud83d\udc33 Kubernetes Deployment ```yaml # Deploy on K8s cluster wit",
      },
      {
        chunkId: "lowlatency-exec-core/src/bench_main.cpp#2",
        score: 0.492327,
        repo: "shivangraval50/lowlatency-exec-core",
        path: "src/bench_main.cpp",
        text: "n tuned to that bar. // This is disclosed, not hidden -- see the printed sample count in // each results row. // // --------------------------------------------------------------------------- // What is and isn't measured here // ------------------------------",
      },
      {
        chunkId: "distributed-training-lab/README.md#10",
        score: 0.487941,
        repo: "shivangraval50/distributed-training-lab",
        path: "README.md",
        text: "silently producing d_model-sized output instead of vocab-sized logits); a dedicated `PPSingleStage` module now handles it. - Correctness, verified locally without any GPU (`tests/test_train_pp.py`, real 2- and 3-process `gloo` runs): (a) each stage's layer ran",
      },
      {
        chunkId: "stat-arb-strategy/backtest.py#3",
        score: 0.484359,
        repo: "shivangraval50/stat-arb-strategy",
        path: "backtest.py",
        text: "strategy = StatArbStrategy( entry_threshold=1.0, # Lowered from 2.0 to 1.0 exit_threshold=0.3, # Lowered from 0.5 to 0.3 stop_loss=0.03, # Tighter stop loss (3%) position_size=0.1 ) signals = strategy.generate_signals(features_df, ml_predictions) results, trad",
      },
      {
        chunkId: "multilingual-entity-resolution/train.py#0",
        score: 0.482949,
        repo: "shivangraval50/multilingual-entity-resolution",
        path: "train.py",
        text: "\"\"\" train.py \u2014 fine-tune multilingual-e5-base on ESCO occupation triplets. Uses sentence-transformers 3.x SentenceTransformerTrainer API. Auto-detects MPS (Apple Silicon), CUDA, or CPU. Usage: python3 module1/train.py python3 module1/train.py --base-model intf",
      },
      {
        chunkId: "lowlatency-exec-core/src/price_scan.cpp#3",
        score: 0.482409,
        repo: "shivangraval50/lowlatency-exec-core",
        path: "src/price_scan.cpp",
        text: "const int64x2_t mask = vreinterpretq_s64_u64(mask_u); sum_vec = vaddq_s64(sum_vec, vandq_s64(mask, quantities)); count_vec = vaddq_s64(count_vec, vandq_s64(mask, ones_vec)); } Quantity total = vgetq_lane_s64(sum_vec, 0) + vgetq_lane_s64(sum_vec, 1); std::size_",
      },
      {
        chunkId: "openbid/docs/superpowers/plans/2026-08-26-openbid.md#122",
        score: 0.479114,
        repo: "shivangraval50/openbid",
        path: "docs/superpowers/plans/2026-08-26-openbid.md",
        text: "art.tsx`, `apps/web/src/components/Latency.tsx` - Modify: `apps/web/src/app/rooms/[id]/LiveRoom.tsx` - Test: `apps/web/src/components/Latency.test.tsx`, `apps/web/src/components/PriceChart.test.tsx` **Interfaces:** - Consumes: `createPriceChart` from `@openbid",
      },
      {
        chunkId: "distributed-training-lab/train_fsdp.py#13",
        score: 0.478399,
        repo: "shivangraval50/distributed-training-lab",
        path: "train_fsdp.py",
        text: "ng real tensor elements # rather than assumed. result.optimizer_state_numel = sum( v.numel() for state in optimizer.state.values() for v in state.values() if torch.is_tensor(v) ) # Full-parameter correctness check: the FSDP analogue of DDP's # weight-sync chec",
      },
      {
        chunkId: "TravelAiAgent/int.py#0",
        score: 0.475939,
        repo: "shivangraval50/TravelAiAgent",
        path: "int.py",
        text: "import streamlit as st import requests import json import os import random from langchain_google_genai import GoogleGenerativeAI from datetime import datetime, timedelta # Streamlit page configuration st.set_page_config(page_title=\"Travel Ai\", layout=\"centered",
      },
    ],
  },];

/* ===========================================================================
 * UI
 * =========================================================================== */

const money = (n: number) => n.toFixed(3);

function ChunkRow({ c, tone }: { c: Candidate; tone: "selected" | "near" }) {
  return (
    <li className="min-w-0 border-t border-line-subtle py-2 first:border-t-0">
      <div className="flex items-baseline gap-2">
        <span
          className={`shrink-0 font-mono text-[0.75rem] tabular-nums ${
            tone === "selected" ? "text-brand-primary" : "text-ink-tertiary"
          }`}
        >
          {c.score.toFixed(3)}
        </span>
        <span className="min-w-0 truncate text-[0.75rem] text-ink-secondary">
          {c.repo}/{c.path}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-[0.75rem] leading-[1.55] text-ink-tertiary">{c.text}</p>
    </li>
  );
}

export default function RagConsolePlayground() {
  const [queryId, setQueryId] = useState(QUERIES[0]!.id);
  const [minTopScore, setMinTopScore] = useState<number>(DEFAULT_POLICY.minTopScore);
  const [minMarginOverMean, setMinMarginOverMean] = useState<number>(
    DEFAULT_POLICY.minMarginOverMean,
  );

  const query = QUERIES.find((q) => q.id === queryId)!;
  const policy: RetrievalPolicy = useMemo(
    () => ({ ...DEFAULT_POLICY, minTopScore, minMarginOverMean }),
    [minTopScore, minMarginOverMean],
  );
  const decision = useMemo(
    () => decideRetrieval(query.candidates, policy),
    [query, policy],
  );

  const calibrated =
    minTopScore === DEFAULT_POLICY.minTopScore &&
    minMarginOverMean === DEFAULT_POLICY.minMarginOverMean;

  const topScore = decision.kind === "empty" ? 0 : decision.topScore;
  const margin = decision.kind === "empty" ? 0 : decision.margin;

  return (
    <PgShell>
      <ScenarioBar
        scenarios={QUERIES.map((q) => ({
          label: q.label === "answerable" ? `covered: ${q.id.slice(2)}` : `not covered: ${q.id.slice(2)}`,
          onClick: () => setQueryId(q.id),
        }))}
      />

      <PgPanel title="Question">
        <p className="text-[0.875rem] leading-[1.6] text-ink-primary">{query.text}</p>
        <p className="mt-2 text-[0.75rem] text-ink-tertiary">
          Labelled <span className="font-medium text-ink-secondary">{query.label}</span> in the
          calibration set — the ground truth the thresholds were fitted against.
        </p>
      </PgPanel>

      <div className="grid gap-3 sm:grid-cols-2">
        <PgSlider
          label="Minimum top score"
          value={minTopScore}
          min={0.3}
          max={0.9}
          step={0.001}
          onChange={setMinTopScore}
          format={money}
        />
        <PgSlider
          label="Minimum margin over the mean"
          value={minMarginOverMean}
          min={0}
          max={0.2}
          step={0.001}
          onChange={setMinMarginOverMean}
          format={money}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatValue label="Top score" value={topScore.toFixed(3)} tone="cyan" />
        <StatValue label="Margin" value={margin.toFixed(3)} tone="cyan" />
        <StatValue
          label="Verdict"
          value={decision.kind}
          tone={decision.kind === "answerable" ? "green" : "amber"}
        />
        <StatValue
          label="Policy"
          value={calibrated ? "calibrated" : "edited"}
          tone={calibrated ? "green" : "amber"}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${decision.kind}-${queryId}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: DUR.short, ease: EASE }}
        >
          {decision.kind === "answerable" ? (
            <PgPanel title={`Answerable — ${decision.selected.length} passages would be sent`}>
              <p className="mb-3 text-[0.75rem] leading-[1.6] text-ink-tertiary">
                The model is called with these passages and nothing else, and is told to cite them
                by number.
              </p>
              <ul className="min-w-0">
                {decision.selected.map((c) => (
                  <ChunkRow key={c.chunkId} c={c} tone="selected" />
                ))}
              </ul>
              {decision.nearMisses.length > 0 && (
                <>
                  <div className="mt-4 mb-1 text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">
                    Near misses — retrieved, not sent
                  </div>
                  <ul className="min-w-0">
                    {decision.nearMisses.map((c) => (
                      <ChunkRow key={c.chunkId} c={c} tone="near" />
                    ))}
                  </ul>
                </>
              )}
            </PgPanel>
          ) : decision.kind === "insufficient" ? (
            <PgPanel title="The corpus does not cover this — no model call is made">
              <p className="text-[0.8125rem] leading-[1.6] text-ink-secondary">
                {refusalMessage(decision.topScore, decision.margin, policy)}
              </p>
              <div className="mt-4 mb-1 text-[0.6875rem] font-semibold uppercase tracking-label text-ink-tertiary">
                Closest passages — shown so you can judge the retrieval yourself
              </div>
              <ul className="min-w-0">
                {decision.nearMisses.map((c) => (
                  <ChunkRow key={c.chunkId} c={c} tone="near" />
                ))}
              </ul>
            </PgPanel>
          ) : (
            <PgPanel title="Nothing retrieved">
              <p className="text-[0.8125rem] text-ink-secondary">
                No chunks at all, so there is nothing to answer from.
              </p>
            </PgPanel>
          )}
        </motion.div>
      </AnimatePresence>

      <PgNote>
        The retrieval is a recording; the decision is live. The four questions and the cosine
        scores beside every passage come from the real 1,117-chunk snapshot — nothing is embedded
        in this tab, and there is no model call here or in the deployed app when the verdict is a
        refusal. What runs on every slider move is <code>decideRetrieval</code>, hand-copied from
        the project, over those real scores. Drag the top-score slider up and watch a covered
        question start refusing: that is the point of the threshold being a parameter rather than
        a constant buried in a pipeline. The calibrated values are the starting position, and
        upstream a test fails if either is edited without re-running the sweep that produced it.
      </PgNote>
    </PgShell>
  );
}
