import type { Metadata } from "next";
import { Accordion } from "@/components/kit/Ui";
import PageHead from "@/components/site/PageHead";

export const metadata: Metadata = { title: "FAQ" };

const ITEMS = [
  { q: "Is this the official provincial government website?", a: "No. It is a volunteer-run civic website under the BetterGov.PH initiative, made by residents of Oriental Mindoro. It is free." },
  { q: "What does MaHalTaNa mean?", a: "Ma for Mangyan, Hal for Mount Halcon, Ta for Tamaraw and Na for Naujan Lake: the four icons of Oriental Mindoro." },
  { q: "Where do the hotline numbers come from?", a: "Each number shows its source and the date we last checked it. Numbers marked unconfirmed come from third-party directories. Please verify before relying on them." },
  { q: "Where does the project data come from?", a: "DPWH project data comes from the DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0). Amounts are budgets, not actual spending." },
  { q: "How can I help?", a: "Contribute code or data on GitHub, or tell us about a wrong or missing number." },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} eyebrow="MGA TANONG" title="FAQ" />
      <div className="mt-8"><Accordion items={ITEMS} /></div>
    </main>
  );
}
