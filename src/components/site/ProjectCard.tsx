import ProjectRow from "./ProjectRow";

/** One result card on the hub: raw title in, summary out. */
export default function ProjectCard({ id, title, bayan, year, status, cost, category }: { id: string; title: string; bayan?: string; year?: number; status?: string; cost?: number; category?: string }) {
  return <ProjectRow id={id} title={title} bayan={bayan} year={year} status={status} cost={cost} category={category} />;
}
