import type { Metadata } from "next";
import HotlineList from "@/components/HotlineList";
import { getHotlines } from "@/lib/hotlines";

export const metadata: Metadata = { title: "Hotlines" };

export default function Hotlines() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga hotline</h1>
      <p className="mt-2 text-black/70">Para sa emergency, tumawag sa <b>911</b>, ang pambansang emergency hotline. Ang mga numero sa ibaba ay para sa buong lalawigan.</p>
      <p className="mt-2 text-sm text-black/60">Lahat ng numero ay may source at petsa ng huling tingin. Hindi ito opisyal na website ng gobyerno; kumpirmahin muna kung may duda.</p>
      <div className="mt-8"><HotlineList rows={getHotlines("province")} /></div>
    </main>
  );
}
