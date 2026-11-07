"use client";
import dynamic from "next/dynamic";

const ProjectMap = dynamic(() => import("./ProjectMap"), { ssr: false, loading: () => <div className="h-80 rounded-2xl bg-black/5 lg:h-96" /> });
export default ProjectMap;
