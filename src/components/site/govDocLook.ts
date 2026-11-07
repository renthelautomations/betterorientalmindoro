import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import type { KitIconName } from "@/components/kit/KitIcon";
import type { EoTopic } from "@/lib/gov-docs";
import type { ReportKind } from "@/lib/gov";

// Plain constants (no "use client"), so server pages can import them.
export const CARD = "rounded-2xl bg-white shadow-sm ring-1 ring-black/5";
export const TOPICS: EoTopic[] = ["organization", "appointment", "finance", "health", "disaster", "environment", "agriculture", "tourism", "education", "peace-order", "other"];
export const TOPIC_LOOK: Record<EoTopic, { color: string; icon: KitIconName }> = {
  organization: { color: FIESTA.blue, icon: "shield" }, appointment: { color: FIESTA.navy, icon: "people" },
  finance: { color: FIESTA_DEEP.orange, icon: "budget" }, health: { color: FIESTA_DEEP.green, icon: "health" },
  disaster: { color: FIESTA_DEEP.sky, icon: "flood" }, environment: { color: FIESTA_DEEP.green, icon: "drop" },
  agriculture: { color: FIESTA_DEEP.green, icon: "farm" }, tourism: { color: FIESTA_DEEP.sky, icon: "mountain" },
  education: { color: FIESTA.blue, icon: "school" }, "peace-order": { color: FIESTA.red, icon: "shield" }, other: { color: FIESTA.navy, icon: "doc" },
};
export const KIND_LOOK: Record<ReportKind, { color: string; icon: KitIconName }> = {
  "supplemental-budget": { color: FIESTA.blue, icon: "budget" }, lgsf: { color: FIESTA_DEEP.green, icon: "doc" },
  assistance: { color: FIESTA_DEEP.orange, icon: "people" }, other: { color: FIESTA.navy, icon: "doc" },
};
