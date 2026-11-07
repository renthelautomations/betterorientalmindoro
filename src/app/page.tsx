"use client";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  return (
    <main>
      <h1 className="h-16 px-4 text-2xl font-bold leading-[4rem]">Better Oriental Mindoro</h1>
      <Map />
    </main>
  );
}
