import type { Metadata } from "next";
import Doc from "@/components/Doc";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <Doc title="Privacy Policy">
      <p>This website does not have user accounts and does not collect personal information through forms.</p>
      <ul>
        <li>No analytics or advertising trackers are used.</li>
        <li>The Hal page loads current weather from Open-Meteo, which receives your IP address as part of the request.</li>
        <li>The hosting provider may keep standard server logs.</li>
      </ul>
      <p>If this changes, for example when we add a contact or report form, we will update this page first.</p>
    </Doc>
  );
}
