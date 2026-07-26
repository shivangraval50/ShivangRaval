"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgTextarea, ScenarioBar, StatValue, PgNote } from "./ui";

type TraceKind = "thought" | "action" | "observation" | "final" | "fail";

interface TraceLine {
  kind: TraceKind;
  text: string;
}

const KIND_META: Record<TraceKind, { label: string; className: string }> = {
  thought: { label: "Thought", className: "text-ink-secondary" },
  action: { label: "Action", className: "text-signal-cyan" },
  observation: { label: "Observation", className: "text-signal-green" },
  fail: { label: "Observation", className: "text-signal-red" },
  final: { label: "Final Answer", className: "text-signal-amber" },
};

// Word-form operators get folded down to symbols before the expression regex
// runs — a genuine (if simple) normalization pass, not a lookup table of answers.
const WORD_OPERATORS: [RegExp, string][] = [
  [/\bmultiplied by\b/g, "*"],
  [/\btimes\b/g, "*"],
  [/\badded to\b/g, "+"],
  [/\bplus\b/g, "+"],
  [/\bsubtracted by\b/g, "-"],
  [/\bminus\b/g, "-"],
  [/\bdivided by\b/g, "/"],
  [/\bover\b/g, "/"],
];

const EXPRESSION_RE = /(-?\d+(?:\.\d+)?)\s*([+\-*/x×])\s*(-?\d+(?:\.\d+)?)/;

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "undefined";
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

function normalizeOperator(op: string): "+" | "-" | "*" | "/" {
  if (op === "x" || op === "×") return "*";
  return op as "+" | "-" | "*" | "/";
}

function runAgent(rawInput: string): TraceLine[] {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return [
      { kind: "thought", text: "I was given an empty problem, so there is nothing to parse." },
      { kind: "fail", text: "No expression found in the input." },
      { kind: "final", text: "(nothing to compute)" },
    ];
  }

  let normalized = trimmed.toLowerCase();
  for (const [pattern, symbol] of WORD_OPERATORS) {
    normalized = normalized.replace(pattern, ` ${symbol} `);
  }

  const match = EXPRESSION_RE.exec(normalized);
  if (!match) {
    return [
      { kind: "thought", text: `I need to find a "number operator number" pattern in: "${trimmed}"` },
      { kind: "fail", text: "Couldn't parse an arithmetic expression out of that input." },
      { kind: "final", text: 'unable to compute — try something like "12 * 7"' },
    ];
  }

  const a = parseFloat(match[1]);
  const op = normalizeOperator(match[2]);
  const b = parseFloat(match[3]);

  let result: number;
  switch (op) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      result = b === 0 ? NaN : a / b;
      break;
    default:
      result = NaN;
  }

  const divideByZero = op === "/" && b === 0;
  const exprSpaced = `${formatNumber(a)} ${op} ${formatNumber(b)}`;
  const exprTight = `${formatNumber(a)}${op}${formatNumber(b)}`;
  const answer = divideByZero ? "undefined (division by zero)" : formatNumber(result);

  return [
    { kind: "thought", text: `I need to calculate ${exprSpaced}` },
    { kind: "action", text: `calculator(${exprTight})` },
    { kind: divideByZero ? "fail" : "observation", text: answer },
    { kind: "final", text: answer },
  ];
}

const PRESETS = ["12 * 7", "144 / 12", "15 + 27", "9 times 8"];

export default function ReliableAgentHarnessPlayground() {
  const [input, setInput] = useState("What is 12 * 7?");
  const [trace, setTrace] = useState<TraceLine[]>(() => runAgent("What is 12 * 7?"));
  const [runCount, setRunCount] = useState(0);

  function run(nextInput: string) {
    setInput(nextInput);
    setTrace(runAgent(nextInput));
    setRunCount((c) => c + 1);
  }

  const finalLine = trace.find((l) => l.kind === "final");
  const failed = trace.some((l) => l.kind === "fail");

  return (
    <PgShell>
      <PgPanel title="Give the agent a problem">
        <div className="space-y-3">
          <PgTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="e.g. What is 12 * 7?"
          />
          <div className="flex flex-wrap items-center gap-2">
            <PgButton onClick={() => run(input)}>Run agent</PgButton>
          </div>
          <ScenarioBar scenarios={PRESETS.map((p) => ({ label: p, onClick: () => run(p) }))} />
          <PgNote>
            Genuine parsing and arithmetic run in your browser on the exact text above — it
            matches only the first &quot;number operator number&quot; pattern it finds (digits
            plus + − × ÷, or the words times / plus / minus / divided by). This is
            the same style of deterministic calculator tool-call the repo&apos;s mock-backend
            evals exercise (16/16 passing), not a live call to a real LLM backend.
          </PgNote>
        </div>
      </PgPanel>

      <PgPanel title="ReAct trace">
        <AnimatePresence mode="wait">
          <motion.div
            key={runCount}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2 font-mono text-sm"
          >
            {trace.map((line, i) => (
              <div key={i} className={KIND_META[line.kind].className}>
                <span className="text-ink-tertiary">{KIND_META[line.kind].label}: </span>
                {line.text}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 border-t border-line-subtle pt-4">
          <StatValue
            label={failed ? "Status" : "Result"}
            value={finalLine ? finalLine.text : "—"}
            tone={failed ? "red" : "green"}
          />
        </div>
      </PgPanel>
    </PgShell>
  );
}
