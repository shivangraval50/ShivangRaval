"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgTextarea, ScenarioBar, PgNote } from "./ui";
import { runMonkey, type MonkeyRunResult } from "./monkeyLang";

const DEFAULT_CODE = `let double = fn(x) { x * 2 }; double(21)`;

const CLOSURES_CODE = `let newAdder = fn(x) {
  fn(y) { x + y };
};
let addTwo = newAdder(2);
let addTen = newAdder(10);
addTwo(3) + addTen(3);`;

const RECURSION_CODE = `let fibonacci = fn(x) {
  if (x < 2) {
    x
  } else {
    fibonacci(x - 1) + fibonacci(x - 2)
  }
};
fibonacci(10);`;

const HOF_CODE = `let applyTwice = fn(f, x) { f(f(x)) };
let increment = fn(x) { x + 1 };
applyTwice(increment, 10);`;

export default function MonkeyInterpreterPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState<MonkeyRunResult>(() => runMonkey(DEFAULT_CODE));
  const [runCount, setRunCount] = useState(0);

  function run(source: string) {
    setResult(runMonkey(source));
    setRunCount((c) => c + 1);
  }

  function runScenario(source: string) {
    setCode(source);
    run(source);
  }

  return (
    <PgShell>
      <PgPanel title="Monkey source (subset)">
        <div className="space-y-3">
          <PgTextarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={9}
            spellCheck={false}
            className="leading-relaxed"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ScenarioBar
              scenarios={[
                { label: "Closures", onClick: () => runScenario(CLOSURES_CODE) },
                { label: "Recursion", onClick: () => runScenario(RECURSION_CODE) },
                { label: "Higher-order functions", onClick: () => runScenario(HOF_CODE) },
              ]}
            />
            <PgButton onClick={() => run(code)}>Run ▸</PgButton>
          </div>
        </div>
      </PgPanel>

      <PgPanel title="Result">
        <div className="flex min-h-[160px] flex-col justify-between gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={runCount}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-line-subtle bg-void p-4"
            >
              {result.ok ? (
                <>
                  <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
                    ⇒ evaluated to
                  </div>
                  <div className="break-all font-mono text-lg font-semibold text-signal-green">{result.output}</div>
                </>
              ) : (
                <>
                  <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">⇒ error</div>
                  <div className="break-all font-mono text-sm leading-relaxed text-signal-red">{result.error}</div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <PgNote>
            Real lexer → parser → tree-walking evaluator for a Monkey subset, written in TypeScript and executed live
            in your browser — not a call to the real OCaml binary. That repo also compiles to a bytecode VM checked
            against its tree-walker for agreement; the VM has no tail-call optimization, so very deep non-tail
            recursion can overflow its stack even where the tree-walker survives.
          </PgNote>
        </div>
      </PgPanel>
    </PgShell>
  );
}
