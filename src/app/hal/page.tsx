import type { Metadata } from "next";
import StoryView from "@/components/StoryView";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.hal.name };

export default function Page() {
  return <StoryView icon="hal" />;
}
