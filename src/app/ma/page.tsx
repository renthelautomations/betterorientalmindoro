import type { Metadata } from "next";
import StoryPage from "@/components/site/StoryPage";
import { Callout } from "@/components/kit/Parts";
import { ICONS } from "@/lib/brand";

export const metadata: Metadata = { title: ICONS.ma.name };

// No imagery and a neutral pattern: Mangyan culture is published only with the communities' approval and credit.
export default function Page() {
  return (
    <StoryPage icon="ma" pattern="mosaic">
      <Callout kind="info" title="Sa pakikipagtulungan lamang">
        Ilalathala lamang ang nilalaman tungkol sa mga Mangyan kasama ng mga komunidad ng Mangyan, at may kanilang pahintulot at pagkilala.
      </Callout>
    </StoryPage>
  );
}
