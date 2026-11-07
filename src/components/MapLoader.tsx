"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false, loading: () => <div className="h-[60vh] min-h-96 rounded-2xl bg-black/5" /> });
export default Map;
