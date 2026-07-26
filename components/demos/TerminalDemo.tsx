"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { TerminalDemo as TerminalDemoData, TerminalLine } from "@/types/project";

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function LineRow({ line }: { line: TerminalLine }) {
  if (line.type === "command") {
    return (
      <div className="flex gap-2">
        <span className="shrink-0 text-signal-green">❯</span>
        <span className="min-w-0 whitespace-pre-wrap break-words text-ink-primary">{line.text}</span>
      </div>
    );
  }
  if (line.type === "comment") {
    return <div className="whitespace-pre-wrap break-words pl-4 text-ink-tertiary/80">// {line.text}</div>;
  }
  return <div className="whitespace-pre-wrap break-words pl-4 text-ink-secondary">{line.text}</div>;
}

export default function TerminalDemo({ data }: { data: TerminalDemoData }) {
  const prefersReduced = useReducedMotion();
  const [revealed, setRevealed] = useState(prefersReduced ? data.lines.length : 0);
  const [typed, setTyped] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    let cancelled = false;
    setRevealed(0);
    setTyped("");

    async function play() {
      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        if (line.type === "command") {
          for (let c = 1; c <= line.text.length; c++) {
            if (cancelled) return;
            setTyped(line.text.slice(0, c));
            await wait(16);
          }
          await wait(240);
        } else {
          await wait(280);
        }
        if (cancelled) return;
        setRevealed(i + 1);
        setTyped("");
      }
    }
    play();
    return () => {
      cancelled = true;
    };
  }, [data, prefersReduced]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed, typed]);

  const activeLine = data.lines[revealed];

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-black/70 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-line-subtle bg-void-elevated px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-signal-red/70" />
        <span className="h-3 w-3 rounded-full bg-signal-amber/70" />
        <span className="h-3 w-3 rounded-full bg-signal-green/70" />
        <span className="ml-3 font-mono text-xs text-ink-tertiary">zsh — demo</span>
      </div>
      <div ref={scrollRef} className="max-h-72 space-y-1.5 overflow-y-auto p-4 font-mono text-sm">
        {data.lines.slice(0, revealed).map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
        {!prefersReduced && activeLine && activeLine.type === "command" && (
          <div className="flex gap-2">
            <span className="shrink-0 text-signal-green">❯</span>
            <span className="min-w-0 whitespace-pre-wrap break-words text-ink-primary">
              {typed}
              <span className="animate-blink">▊</span>
            </span>
          </div>
        )}
        {revealed >= data.lines.length && (
          <div className="flex gap-2 pt-1">
            <span className="text-signal-green">❯</span>
            <span className="animate-blink text-ink-primary">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}
