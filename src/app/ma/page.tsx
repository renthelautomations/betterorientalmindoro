import type { Metadata } from "next";
import StoryPage from "@/components/site/StoryPage";
import { Callout } from "@/components/kit/Parts";
import { ICONS } from "@/lib/brand";
import { DICT } from "@/lib/i18n/dict";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: ICONS.ma.name };

// No imagery and a neutral pattern: Mangyan culture is published only with the communities' approval and credit.
export default function Page() {
  return (
    <StoryPage icon="ma">
      <Bilingual
        en={<Callout kind="info" title={DICT["docs.ma.callout.title"][0]}>{DICT["docs.ma.callout.body"][0]}</Callout>}
        fil={<Callout kind="info" title={DICT["docs.ma.callout.title"][1]}>{DICT["docs.ma.callout.body"][1]}</Callout>}
      />
    </StoryPage>
  );
}
