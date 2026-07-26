import type { Demo } from "@/types/project";
import TerminalDemo from "./TerminalDemo";
import MetricsDemo from "./MetricsDemo";

export default function DemoPanel({ demo }: { demo: Demo }) {
  if (demo.kind === "terminal") return <TerminalDemo data={demo} />;
  return <MetricsDemo data={demo} />;
}
