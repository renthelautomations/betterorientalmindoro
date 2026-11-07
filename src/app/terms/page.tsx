import type { Metadata } from "next";
import Doc from "@/components/Doc";

export const metadata: Metadata = { title: "Terms of Use" };

export default function Page() {
  return (
    <Doc title="Terms of Use">
      <p>Better Oriental Mindoro is a volunteer-led civic website under the BetterGov.PH initiative. It is not the official website of the Provincial Government of Oriental Mindoro or of any local government unit.</p>
      <h2>Use of information</h2>
      <p>Information is gathered from public sources and shown for general reference. We try to keep it accurate and show the source and date for each item, but we cannot guarantee it is complete or current. Confirm with the proper office before acting on it, especially for emergencies, permits and payments.</p>
      <h2>Open source</h2>
      <p>The website code is released under the MIT License. Public data keeps the license of its source, shown where the data appears.</p>
      <h2>No warranty</h2>
      <p>The site is provided as is, free of charge, by volunteers.</p>
    </Doc>
  );
}
