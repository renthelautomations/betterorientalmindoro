import type { Metadata } from "next";
import StoryPage from "@/components/site/StoryPage";
import NaujanScroll from "@/components/kit/NaujanScroll";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.na.name };

export default function Page() {
  return <StoryPage icon="na" pattern="wave" scene={<NaujanScroll />} />;
}
