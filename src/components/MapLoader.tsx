"use client";
import dynamic from "next/dynamic";
import ReliefSvg from "./ReliefSvg";

type Props = { slugs: Record<string, string>; values?: Record<string, number>; onSelect?: (slug: string | null) => void; selected?: string | null };
// While the heavy map script loads, the lightweight relief drawing is shown, so there is never an empty grey box.
const Map = dynamic(() => import("./Map"), { ssr: false, loading: () => <div className="h-[62vh] min-h-96 animate-pulse rounded-3xl bg-fiesta-mint motion-reduce:animate-none" aria-hidden /> });
export default function MapLoader(props: Props) { return <Map {...props} />; }
export { ReliefSvg };
