"use client";
import dynamic from "next/dynamic";

const HazardMap = dynamic(() => import("./HazardMap"), { ssr: false, loading: () => <div className="h-[26rem] rounded-2xl bg-black/5 lg:h-[32rem]" /> });
export default HazardMap;
