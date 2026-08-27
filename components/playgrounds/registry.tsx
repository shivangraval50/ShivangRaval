import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function loading() {
  return (
    <div className="rounded-control bg-void-surface p-10 text-center text-[0.8125rem] text-ink-tertiary ring-1 ring-inset ring-line-subtle motion-safe:animate-pulse">
      loading playground…
    </div>
  );
}

// Every project gets a dedicated, genuinely interactive playground component
// (real client-side computation from visitor input, not a scripted replay).
// Keyed by Project.id from data/projects.ts.
export const PLAYGROUNDS: Record<string, ComponentType> = {
  "stat-arb-strategy": dynamic(() => import("./StatArbPlayground"), { loading, ssr: false }),
  "market-simulator": dynamic(() => import("./MarketSimulatorPlayground"), { loading, ssr: false }),
  "smart-order-router": dynamic(() => import("./SmartOrderRouterPlayground"), { loading, ssr: false }),
  "orderbook-ocaml": dynamic(() => import("./OrderBookPlayground"), { loading, ssr: false }),
  "monkey-ocaml": dynamic(() => import("./MonkeyInterpreterPlayground"), { loading, ssr: false }),
  "lowlatency-exec-core": dynamic(() => import("./LowLatencyExecPlayground"), { loading, ssr: false }),
  "streaming-data-pipeline": dynamic(() => import("./StreamingPipelinePlayground"), { loading, ssr: false }),
  "openbid": dynamic(() => import("./OpenBidPlayground"), { loading, ssr: false }),
  "llm-inference-engine": dynamic(() => import("./LLMInferenceEnginePlayground"), { loading, ssr: false }),
  "distributed-training-lab": dynamic(() => import("./DistributedTrainingLabPlayground"), { loading, ssr: false }),
  "distributed-ml-training": dynamic(() => import("./DistributedMLTrainingPlayground"), { loading, ssr: false }),
  "reliable-agent-harness": dynamic(() => import("./ReliableAgentHarnessPlayground"), { loading, ssr: false }),
  "agent-rl-benchmark-gym": dynamic(() => import("./AgentRLGymPlayground"), { loading, ssr: false }),
  "ai-infra-stack": dynamic(() => import("./AiInfraStackPlayground"), { loading, ssr: false }),
  "tiny-llm-from-scratch": dynamic(() => import("./TinyLLMPlayground"), { loading, ssr: false }),
  "rag-chatbot-rlhf": dynamic(() => import("./RagChatbotPlayground"), { loading, ssr: false }),
  "llm-policy-content-classifier": dynamic(() => import("./PolicyClassifierPlayground"), { loading, ssr: false }),
  "multilingual-entity-resolution": dynamic(() => import("./EntityResolutionPlayground"), { loading, ssr: false }),
  "travel-ai-agent": dynamic(() => import("./TravelAgentPlayground"), { loading, ssr: false }),
  "masters-cafe": dynamic(() => import("./MastersCafePlayground"), { loading, ssr: false }),
  "matrimony": dynamic(() => import("./MatrimonyPlayground"), { loading, ssr: false }),
};
