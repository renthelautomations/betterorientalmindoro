import type { Metadata } from "next";
import Doc from "@/components/Doc";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <Doc title="FAQ">
      <h2>Is this the official provincial government website?</h2>
      <p>No. It is a volunteer-run civic website under the BetterGov.PH initiative, made by residents of Oriental Mindoro. It is free.</p>
      <h2>What does MaHalTaNa mean?</h2>
      <p>Ma for Mangyan, Hal for Mount Halcon, Ta for Tamaraw and Na for Naujan Lake: the four icons of Oriental Mindoro.</p>
      <h2>Where do the hotline numbers come from?</h2>
      <p>Each number shows its source and the date we last checked it. Numbers marked unconfirmed come from third-party directories. Please verify before relying on them.</p>
      <h2>Where does the project data come from?</h2>
      <p>DPWH project data comes from the DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0). Amounts are budgets, not actual spending.</p>
      <h2>How can I help?</h2>
      <p>Contribute code or data on GitHub, or tell us about a wrong or missing number.</p>
    </Doc>
  );
}
