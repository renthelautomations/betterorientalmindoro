import type { Metadata } from "next";
import StoryPage from "@/components/site/StoryPage";
import HalconScroll from "@/components/kit/HalconScroll";
import WeatherNow from "@/components/WeatherNow";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.hal.name };

export default function Page() {
  return (
    <StoryPage icon="hal" scene={<HalconScroll />}>
      <WeatherNow />
    </StoryPage>
  );
}
