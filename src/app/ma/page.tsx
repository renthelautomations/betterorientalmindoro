import type { Metadata } from "next";
import StoryView from "@/components/StoryView";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.ma.name };

export default function Page() {
  return <StoryView icon="ma" />;
}
