import type { Metadata } from "next";
import StoryPage from "@/components/site/StoryPage";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.ta.name };

export default function Page() {
  return <StoryPage icon="ta" pattern="horns" />;
}
