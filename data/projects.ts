import type { Project } from "@/types/project";

// Every metric below is sourced from each repo's own README/RESULTS files.
// Where a repo's own headline number was inflated, contradicted itself, or
// wasn't actually measured yet, the card leads with the more defensible
// figure and `accuracyNote` carries the fuller, honest context.
export const PROJECTS: Project[] = [
  // ---------- AI / ML Infra ----------
  {
    id: "llm-inference-engine",
    title: "LLM Inference Engine",
    pitch: "vLLM-style serving techniques — paged KV-cache, continuous batching, quantization, speculative decoding — built and honestly benchmarked from scratch.",
    description:
      "Reimplements the core techniques behind production LLM serving engines on a shared toy transformer, then benchmarks each one honestly on CPU rather than assuming the textbook GPU story holds — including where a technique measures slower without GPU-specific hardware to exploit.",
    category: "ai-infra",
    tech: ["PyTorch", "Python", "CUDA (planned)"],
    metrics: [
      { label: "Continuous Batching", value: "1.64× faster", status: "measured" },
      { label: "Paged KV-Cache (CPU)", value: "32% slower", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Continuous Batching (8 req)", value: "1.64× faster", status: "measured" },
        { label: "Paged KV-Cache", value: "32% slower", status: "measured" },
        { label: "INT8 Quantization", value: "2.12× slower", status: "measured" },
        { label: "Speculative Decoding", value: "1.28× slower", status: "measured" },
      ],
    },
    accuracyNote:
      "All benchmarks run on CPU with a randomly-initialized (untrained) model — they test the mechanics and overhead of each serving technique in isolation, not end-to-end production throughput. Paged attention and quantization show overhead here because their real benefit (memory efficiency, real low-bit GEMM kernels) only shows up on GPU — that slowdown is an expected, honestly-reported finding, not a bug. A CUDA/C++ engine benchmarked against vLLM/llama.cpp hasn't been built yet.",
    github: "https://github.com/shivangraval50/llm-inference-engine",
    featured: true,
  },
  {
    id: "distributed-training-lab",
    title: "Distributed Training Lab",
    pitch: "From-scratch DDP → FSDP → tensor-parallel → pipeline-parallel, each verified correct on CPU before any GPU claim.",
    description:
      "Builds the mechanics behind multi-GPU training from scratch — DDP, FSDP, tensor parallelism, and pipeline parallelism — on a tiny transformer, with each stage's numerical correctness independently verified since no local GPU is available.",
    category: "ai-infra",
    tech: ["PyTorch", "torch.distributed", "FSDP", "DTensor"],
    metrics: [
      { label: "DDP Rank Parity", value: "bit-identical", status: "measured" },
      { label: "TP/PP Numerical Error", value: "~1e-5–1e-7", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "CPU Loss (300 steps)", value: "3.46 → 0.94", status: "measured" },
        { label: "FSDP Shard Split", value: "50/50 (2 ranks)", status: "measured" },
        { label: "TP/PP Parity Error", value: "~3e-7 / 5.7e-5", status: "measured" },
      ],
    },
    accuracyNote:
      "All 6 phases are verified for numerical correctness on CPU (gloo backend). Real multi-GPU throughput/memory/speedup numbers aren't measured yet — the notebooks are written but haven't been run on a GPU.",
    github: "https://github.com/shivangraval50/distributed-training-lab",
  },
  {
    id: "distributed-ml-training",
    title: "Distributed ML Training Platform",
    pitch: "PyTorch DDP training infrastructure — one real speedup measured on CPU multiprocessing; GPU-cluster numbers are projections.",
    description:
      "Infrastructure for distributed data-parallel training with PyTorch DDP and MLflow experiment tracking. The one number actually measured — 2.95× — comes from CPU multiprocessing on a laptop; multi-GPU cluster figures in the README are extrapolations, and two of its own projection tables disagree with each other.",
    category: "ai-infra",
    tech: ["PyTorch", "DDP", "MLflow", "Kubernetes"],
    metrics: [
      { label: "Measured Speedup", value: "2.95× (CPU)", status: "measured" },
      { label: "Projected (12 GPU)", value: "10.6×–13.3×", status: "projected" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Measured (4-proc CPU)", value: "2.95×", status: "measured" },
        { label: "Projected (12 GPU)", value: "10.6×–13.3×", status: "projected" },
        { label: "Real GPU Run", value: "not yet done", status: "stubbed" },
      ],
    },
    accuracyNote:
      "The only real measurement is 2.95× (8.47s→2.87s) using 4 CPU processes on a MacBook Air M2 — not GPUs. The README's headline \"10.6× (8h→45min)\" and a separate 12-GPU projection of 13.3× both appear in the same document and don't agree with each other; treat all multi-GPU numbers as unverified extrapolation, not measurement.",
    github: "https://github.com/shivangraval50/distributed-ml-training",
  },
  {
    id: "reliable-agent-harness",
    title: "Reliable Agent Harness",
    pitch: "An eval rig for LLM agents — rubric-graded tasks, a failure-mode taxonomy, guardrails, and a CI gate.",
    description:
      "The product here is the evaluation harness, not the agent: a ReAct-style loop wrapped in retries and guardrails, graded against rubric tasks with a documented failure-mode taxonomy and a CI gate that runs on every change.",
    category: "ai-infra",
    tech: ["Python", "ReAct", "GitHub Actions"],
    metrics: [{ label: "Mock-Backend Evals", value: "16/16 passing", status: "measured" }],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: 'python3 -m agent --backend mock "What is 12 * 7?"' },
        { type: "output", text: "Thought: I need to calculate 12 * 7" },
        { type: "output", text: "Action: calculator(12*7)" },
        { type: "output", text: "Observation: 84" },
        { type: "output", text: "Final Answer: 84" },
      ],
    },
    accuracyNote:
      "The 16/16 pass rate is against a deterministic mock backend used to test the harness machinery itself — real-LLM backend (Ollama/Anthropic) reliability isn't measured in the tracked suite yet.",
    github: "https://github.com/shivangraval50/reliable-agent-harness",
  },
  {
    id: "agent-rl-benchmark-gym",
    title: "Agent RL Benchmark Gym",
    pitch: "A Gymnasium environment for entity-disambiguation RL, with rewards grounded in a fine-tuned multilingual encoder.",
    description:
      "A custom Gymnasium environment where a PPO agent learns to disambiguate entity references, using cosine similarity from a frozen pretrained encoder as its reward signal instead of learning representations from scratch.",
    category: "ai-infra",
    tech: ["Gymnasium", "Stable-Baselines3", "PPO"],
    metrics: [
      { label: "PPO vs Random", value: "57.6% vs 50%", status: "measured" },
      { label: "Training Time", value: "37s / 100K steps", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "PPO Accuracy", value: "57.6%", status: "measured" },
        { label: "Mean Episode Score", value: "+8.54", status: "measured" },
        { label: "Training Time (CPU)", value: "37s / 100K steps", status: "measured" },
      ],
      chart: [
        { label: "Random baseline", value: 50 },
        { label: "PPO agent", value: 58 },
      ],
    },
    accuracyNote:
      "Reward-shaping reuses a frozen pretrained encoder's similarity score rather than learning its own representation — the gains reflect the RL policy learning to use that signal well, not encoder quality itself.",
    github: "https://github.com/shivangraval50/agent-rl-benchmark-gym",
  },
  {
    id: "ai-infra-stack",
    title: "AI Infrastructure Stack",
    pitch: "A shared Next.js frontend showcasing three independently-built ML modules through live demos rather than static write-ups.",
    description:
      "The hub-and-spoke frontend for three separate ML projects — a policy-driven content classifier, an RL entity-disambiguation gym, and a multilingual entity-resolution encoder — deployed together on Vercel.",
    category: "ai-infra",
    tech: ["Next.js 14", "TypeScript", "Vercel"],
    metrics: [{ label: "ML Modules", value: "3", status: "measured" }],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "npm install && npm run dev" },
        { type: "output", text: "ready - started server on http://localhost:3000" },
        { type: "comment", text: "frontend shell for the content-classifier, RL gym, and entity-resolution modules" },
      ],
    },
    accuracyNote: "This repo is the frontend shell only — all real modeling and benchmark numbers live in the three linked module repos.",
    github: "https://github.com/shivangraval50/ai-infra-stack",
    homepage: "https://ai-infra-stack.vercel.app",
  },

  // ---------- NLP & Applied ML ----------
  {
    id: "tiny-llm-from-scratch",
    title: "Tiny LLM From Scratch",
    pitch: "A from-scratch pretrain → SFT → DPO pipeline for a 29M-param transformer, with every phase gated on real GPU hours, not assumed.",
    description:
      "Builds a small language model end-to-end — byte-level BPE tokenizer, RoPE positional encoding, pretraining, supervised fine-tuning, and DPO preference alignment — with an evaluation harness validated on synthetic trials before spending a single real GPU hour.",
    category: "nlp",
    tech: ["PyTorch", "RoPE", "BPE Tokenizer", "DPO"],
    metrics: [
      { label: "Model Size", value: "29.4M params", status: "measured" },
      { label: "Training Budget", value: "~588M tokens", status: "projected" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Params", value: "29.4M (25.2M non-emb)", status: "measured" },
        { label: "Eval CI Coverage", value: "~95% (bootstrap)", status: "measured" },
        { label: "Training Budget", value: "588M tokens", status: "projected" },
      ],
    },
    accuracyNote:
      "No model has been trained yet — pretraining/SFT/DPO all require GPU hours not yet spent (Kaggle/Colab T4 planned). What's verified: the architecture, tokenizer, and evaluation harness (bootstrap CI coverage, contamination detection) all work correctly on toy/synthetic data. Any results currently in the repo are explicitly labeled toy/demo, not real training runs.",
    github: "https://github.com/shivangraval50/tiny-llm-from-scratch",
    featured: true,
  },
  {
    id: "rag-chatbot-rlhf",
    title: "Production RAG System with RLHF",
    pitch: "A FAISS-backed RAG pipeline with semantic reranking, Redis caching, and a human-feedback loop.",
    description:
      "A retrieval-augmented generation pipeline: FAISS retrieval, cross-encoder reranking, Redis response caching, and an RLHF-style endpoint that folds human feedback back into ranking. Caching cuts repeat-query latency from ~1.85s to under 10ms.",
    category: "nlp",
    tech: ["LangChain", "FAISS", "FastAPI", "Redis"],
    metrics: [
      { label: "Cached Latency", value: "<10ms", status: "measured" },
      { label: "Cache Hit Rate", value: "60%", status: "measured" },
    ],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: 'curl -X POST /api/query -d \'{"query":"What is machine learning?"}\'' },
        { type: "output", text: "→ retrieval 1008ms + generation 842ms = 1850ms (uncached)" },
        { type: "comment", text: "identical query, second call" },
        { type: "output", text: '{"cached": true, "latency_ms": 8}' },
      ],
    },
    accuracyNote:
      "The README also reports a 100% relevance score and 0% error rate in \"production testing\" with no separate benchmark file backing those two figures — worth real skepticism, unlike the caching/reranking numbers above which have more concrete detail behind them.",
    github: "https://github.com/shivangraval50/rag-chatbot-rlhf",
  },
  {
    id: "llm-policy-content-classifier",
    title: "Policy-Driven Content Classifier",
    pitch: "Turns a plain-English moderation policy into a zero-shot classifier via embedding similarity — no fine-tuning required.",
    description:
      "Takes a plain-English content policy, embeds policy-derived violation/compliant examples with a multilingual encoder, and classifies new content by similarity margin — so moderation rules can change without retraining a model.",
    category: "nlp",
    tech: ["Gemini 1.5 Flash", "Sentence Embeddings", "FastAPI", "Gradio"],
    metrics: [{ label: "Approach", value: "Zero-shot, embedding-based", status: "measured" }],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "python3 module3/app.py" },
        { type: "comment", text: "policy: \"flag job postings that misrepresent seniority\"" },
        { type: "output", text: "→ content flagged · similarity margin +0.142" },
      ],
    },
    accuracyNote: "No aggregate precision/recall benchmark is published — the one worked example above is the sole reported data point.",
    github: "https://github.com/shivangraval50/llm-policy-content-classifier",
  },
  {
    id: "multilingual-entity-resolution",
    title: "Multilingual Entity Resolution",
    pitch: "Fine-tunes a multilingual encoder to match equivalent job titles across English, French, and German.",
    description:
      "Fine-tunes a multilingual sentence encoder with contrastive (InfoNCE) loss so equivalent job-title entities — e.g. \"VP Sales Operations\" and \"RevOps Manager\" — resolve to the same identity across languages, indexed for fast retrieval with FAISS.",
    category: "nlp",
    tech: ["Sentence Transformers", "FAISS", "InfoNCE Loss"],
    metrics: [{ label: "Precision@1 (reported)", value: "1.0 all splits", status: "measured" }],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Precision@1", value: "1.0", status: "measured" },
        { label: "MRR", value: "1.0", status: "measured" },
        { label: "Dataset", value: "ESCO · 2,942 occupations", status: "measured" },
      ],
    },
    accuracyNote:
      "Worth reading skeptically: a perfect 1.0 across every split — including an external benchmark — is more often a sign of a small or overlapping eval set than genuine generalization. Showing the number as reported rather than hiding it, but it shouldn't be taken at face value without a harder, held-out test.",
    github: "https://github.com/shivangraval50/multilingual-entity-resolution",
  },

  // ---------- Quant Trading ----------
  {
    id: "smart-order-router",
    title: "Smart Order Router",
    pitch: "An adaptive router that scores 8 simulated venues on latency, fees, and liquidity — 74% better fills than round-robin.",
    description:
      "A multi-factor smart order router that continuously tracks per-venue latency, fill rate, fees, and liquidity, and routes accordingly. Against a round-robin baseline built in the same repo, it improves fill rates by 74% on average and 87% under simulated network stress.",
    category: "quant",
    tech: ["Python", "NumPy", "Prometheus", "EMA"],
    metrics: [
      { label: "Fill Improvement", value: "74.3%", status: "measured" },
      { label: "Under Stress", value: "86.9%", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Fill Improvement", value: "74.3%", status: "measured" },
        { label: "Latency Reduction", value: "44.2%", status: "measured" },
        { label: "Decision Throughput", value: "269K/s", status: "measured" },
      ],
      chart: [
        { label: "Normal conditions", value: 74 },
        { label: "Under network stress", value: 87 },
      ],
    },
    accuracyNote:
      "Benchmarked against a round-robin baseline built in the same repo, across 8 simulated (not live) venues — a simulation study, not a live-market result, despite the \"production-ready\" framing in the README.",
    github: "https://github.com/shivangraval50/smart-order-router",
    featured: true,
  },
  {
    id: "market-simulator",
    title: "Low-Latency Market Simulator",
    pitch: "An 8-venue order-book simulator — 5.68M raw events/sec, 149K/sec once real order matching is included.",
    description:
      "A multi-venue market simulator with an ML slippage predictor. Raw event-scheduling throughput reaches 5.68M events/sec, but that figure excludes order matching — with real 8-venue matching included, sustained throughput is 149K events/sec, still fast, and the more honest number to lead with.",
    category: "quant",
    tech: ["Python", "Numba", "scikit-learn", "SortedContainers"],
    metrics: [
      { label: "Full-Matching Throughput", value: "149K evt/s", status: "measured" },
      { label: "Slippage MAE", value: "94.3% ↓", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Raw Scheduling", value: "5.68M evt/s", status: "measured" },
        { label: "With Real Matching", value: "149K evt/s", status: "measured" },
        { label: "Slippage MAE", value: "7.43→0.42 bps", status: "measured" },
      ],
    },
    accuracyNote:
      "5.68M events/sec is raw event-scheduling throughput with no order matching; once real 8-venue matching logic runs, sustained throughput is 149K events/sec — about 38× lower. Both are real measurements from the same benchmark suite; showing both rather than leading with just the bigger one. All data is synthetically generated by the same codebase being benchmarked.",
    github: "https://github.com/shivangraval50/market-simulator",
  },
  {
    id: "stat-arb-strategy",
    title: "ML-Driven Statistical Arbitrage",
    pitch: "A LightGBM + Kalman-filter mean-reversion strategy — backtested three ways, with three different answers.",
    description:
      "A statistical arbitrage strategy combining a 3-model LightGBM ensemble with Kalman-filtered hedge ratios. Backtested on synthetic data under three different assumption sets, which produced three very different Sharpe ratios — reported here honestly rather than cherry-picked.",
    category: "quant",
    tech: ["Python", "LightGBM", "Kalman Filter", "Numba"],
    metrics: [
      { label: "Base Backtest", value: "Sharpe 10.5", status: "measured" },
      { label: "Realistic Costs", value: "Sharpe −17.8", status: "measured" },
    ],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "Base Backtest", value: "Sharpe 10.5", status: "measured" },
        { label: "ML-Enhanced Run", value: "Sharpe 256", status: "measured" },
        { label: "Realistic Costs", value: "Sharpe −17.8", status: "measured" },
      ],
    },
    accuracyNote:
      "This repo contains three internally-inconsistent backtests on synthetic data: a base run (Sharpe 10.5), an ML-enhanced run its own results file calls \"exceptional\" (Sharpe 256 — implausibly high), and a stricter \"realistic-costs\" run that shows the strategy losing money (Sharpe −17.8). The README's headlined \"Sharpe 1.4–1.6\" is a forward-looking production target, not a number derived from any backtest in the repo. None of these are fabricated — they're all real outputs — but they disagree wildly and shouldn't be read as one clean result.",
    github: "https://github.com/shivangraval50/stat-arb-strategy",
  },

  // ---------- Systems & Languages ----------
  {
    id: "orderbook-ocaml",
    title: "Order Book Engine (OCaml)",
    pitch: "A price-time-priority limit order book and matching engine in OCaml, exposed live over TCP.",
    description:
      "A limit order book and matching engine in OCaml supporting GTC/IOC/FOK order semantics, built on Eio structured concurrency and exposed over a TCP gateway — property-tested for invariants like no-crossed-book and deterministic matching.",
    category: "systems",
    tech: ["OCaml", "Eio", "Dune", "QCheck"],
    metrics: [{ label: "Order Types", value: "GTC · IOC · FOK", status: "measured" }],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "dune exec bin/main.exe" },
        { type: "command", text: "LIMIT SELL 100 10" },
        { type: "output", text: "ACCEPTED id=1 · RESTING" },
        { type: "command", text: "LIMIT BUY 100 4" },
        { type: "output", text: "ACCEPTED id=2" },
        { type: "output", text: "TRADE taker=2 maker=1 qty=4 @ 100 · FILLED" },
        { type: "comment", text: "property-tested for no-crossed-book and deterministic matching" },
      ],
    },
    accuracyNote:
      "No throughput number is published for this engine yet — a benchmark harness exists but hasn't printed a public result. What's shown here is real, verified matching behavior.",
    github: "https://github.com/shivangraval50/orderbook-ocaml",
    featured: true,
  },
  {
    id: "monkey-ocaml",
    title: "Monkey Language (OCaml)",
    pitch: "A full language implementation — lexer, parser, type inference, bytecode VM — for the Monkey language, in OCaml.",
    description:
      "A complete implementation of the Monkey programming language: lexer, parser, tree-walking evaluator, Hindley-Milner type inference, a bytecode compiler, and a VM — with both execution backends checked to agree, plus a browser build via js_of_ocaml.",
    category: "systems",
    tech: ["OCaml", "js_of_ocaml", "Dune"],
    metrics: [{ label: "Backends", value: "Tree-walker + VM", status: "measured" }],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "dune exec bin/main.exe" },
        { type: "command", text: "let double = fn(x) { x * 2 };" },
        { type: "output", text: "null" },
        { type: "command", text: "double(21)" },
        { type: "output", text: "42" },
        { type: "comment", text: "checked to agree on both the tree-walker and the bytecode VM" },
      ],
    },
    accuracyNote:
      "No speed comparison between the VM and tree-walker is published yet, though a benchmark exists to produce one. The VM also has no tail-call optimization, so deep non-tail recursion can overflow its stack where the tree-walker won't — disclosed directly in the README.",
    github: "https://github.com/shivangraval50/monkey-ocaml",
  },
  {
    id: "lowlatency-exec-core",
    title: "Low-Latency Execution Core",
    pitch: "A price-time-priority matching engine in C++20 — lock-free ring buffer, SIMD price scans — correctness-verified, benchmarking in progress.",
    description:
      "A from-scratch matching engine built phase by phase in C++20: lock-free ring buffer, cache-aligned slab allocator, NEON/AVX2 SIMD price scans, and a latency-percentile harness — each phase correctness-tested before any performance claim.",
    category: "systems",
    tech: ["C++20", "CMake", "SIMD (NEON/AVX2)"],
    metrics: [{ label: "NEON Correctness", value: "500/500 trials", status: "measured" }],
    demo: {
      kind: "metrics",
      metrics: [
        { label: "SIMD Correctness", value: "500-trial verified", status: "measured" },
        { label: "Latency Percentiles", value: "harness built", status: "stubbed" },
        { label: "AVX2 Path", value: "compiles, unrun", status: "stubbed" },
      ],
    },
    accuracyNote:
      "No latency numbers exist yet. The benchmark harness is built and NEON SIMD correctness is verified via property testing, but p50/p99/p99.9 latency figures are still TODO — there's no local x86 hardware to run the AVX2 path, and the percentile harness hasn't been run as a controlled benchmark yet.",
    github: "https://github.com/shivangraval50/lowlatency-exec-core",
  },
  {
    id: "streaming-data-pipeline",
    title: "High-Throughput Streaming Pipeline",
    pitch: "An async Kafka pipeline — 66.7K events/sec measured per instance; horizontal scaling is claimed but not yet demonstrated.",
    description:
      "An async Python pipeline built on Kafka for high-throughput event processing. A single instance sustains 66.7K events/sec; a 5-instance load test measured the same combined throughput as one instance alone, so the widely-quoted \"333K events/sec\" is a capacity projection, not what that test actually measured.",
    category: "systems",
    tech: ["Kafka", "aiokafka", "Python AsyncIO", "Prometheus"],
    metrics: [
      { label: "Single-Instance Throughput", value: "66.7K evt/s", status: "measured" },
      { label: "E2E Latency", value: "<2s", status: "measured" },
    ],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "python -m pipeline.consumer --topic trades" },
        { type: "output", text: "[consumer-0] connected · sustained throughput: 66,667 events/sec" },
        { type: "output", text: "[metrics] p50 e2e latency: ~300ms · backlog: 0" },
        { type: "comment", text: "5-instance load test measured the same combined throughput as 1 instance" },
      ],
    },
    accuracyNote:
      "The raw load-test output (BENCHMARK_RESULTS.txt) shows a 5-instance run achieving the same combined 66,667 events/sec as a single instance — no realized scaling. The polished README's \"333,333 events/sec (5 instances)\" is 5× that number presented as a capacity projection, not the measured result of that test. Leading with the single-instance, measured number here.",
    github: "https://github.com/shivangraval50/-streaming-data-pipeline",
  },

  // ---------- Applied Apps ----------
  {
    id: "travel-ai-agent",
    title: "Travel AI Agent",
    pitch: "A FastAPI service that turns trip preferences into a Gemini-generated day-by-day itinerary.",
    description:
      "Takes structured trip preferences — destination, dates, budget, party size — and generates a full day-by-day itinerary using Gemini via LangChain, returned as clean, validated JSON.",
    category: "apps",
    tech: ["FastAPI", "LangChain", "Gemini", "Pydantic"],
    metrics: [],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: 'POST /generate-itinerary {"destination":"Goa","days":3}' },
        { type: "output", text: '{"day": "Day 1 (2025-01-14)", "activities": [' },
        { type: "output", text: '  {"time": "Morning", "activity": "Arrive in Goa and check into hotel"},' },
        { type: "output", text: '  {"time": "Afternoon", "activity": "Beach relaxation at Vagator"}' },
        { type: "output", text: "]}" },
      ],
    },
    accuracyNote: "No benchmarks are published for this one — it's a straightforward, working API integration, shown here as a real request/response rather than a performance story.",
    github: "https://github.com/shivangraval50/TravelAiAgent",
    featured: true,
  },
  {
    id: "masters-cafe",
    title: "Master's Cafe",
    pitch: "A chat-style AI advisor UI for NEU MS CS students — currently a UI prototype, not yet wired to a real model.",
    description:
      "A Next.js chat interface framed as an AI advisor for Northeastern MS CS students — course planning, ROI, burnout risk. Right now the chat response is a single hardcoded reply rather than a live model call; the interaction design is real, the model behind it isn't wired up yet.",
    category: "apps",
    tech: ["Next.js 15", "React 19", "shadcn/ui", "Tailwind v4"],
    metrics: [],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "npm run dev" },
        { type: "output", text: "ready - http://localhost:3000" },
        { type: "comment", text: "chat UI is real; the reply is currently a hardcoded placeholder, not a live model call" },
      ],
    },
    accuracyNote:
      "Important to say plainly: despite the AI-advisor framing, the current build returns one hardcoded canned reply via a setTimeout mock rather than calling a real model. The UI/UX is genuinely built; the AI part isn't live yet.",
    github: "https://github.com/shivangraval50/masters-cafe",
    homepage: "https://masters-cafe.vercel.app",
  },
  {
    id: "matrimony",
    title: "Saptavidhi Matrimony Tools",
    pitch: "A set of Streamlit admin tools for a matchmaking service — profile, preference, and family management, plus an AI chat-intent analyzer.",
    description:
      "A collection of Streamlit + Gemini admin scripts for a matchmaking service (\"Saptavidhi\") — profile, preference, and family management over CSV exports, plus a chat-intent analyzer. No README exists yet, so this is inferred from the code itself.",
    category: "apps",
    tech: ["Python", "Streamlit", "Gemini"],
    metrics: [],
    demo: {
      kind: "terminal",
      lines: [
        { type: "command", text: "streamlit run chat_analysis.py" },
        { type: "comment", text: "no README or published output yet — inferred from source" },
      ],
    },
    accuracyNote:
      "This repo has no README, so scope here is inferred from filenames and one source file. Worth flagging directly: app.py contains one commented-out line that looks like a live Google API key — worth double-checking and rotating if it was ever a real credential, and adding a README before featuring this more prominently.",
    github: "https://github.com/shivangraval50/Matrimony",
  },
];
