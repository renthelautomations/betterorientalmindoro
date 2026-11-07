// STUB replaced by gov/a
import type { Flag } from "@/lib/gov-flags";

export default function GovFlagCard({ flag }: { flag: Flag }) {
  return <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"><h3 className="font-semibold">{flag.title}</h3><p className="mt-1 text-sm text-black/75">{flag.what}</p></article>;
}
