import { getLguDirectory } from "@/lib/lgu-directory";
import LguDirectoryView from "./LguDirectoryView";

/** Office directory of one LGU (office, head, number, email). Renders nothing when none is published. */
export default function LguDirectory({ slug, name, collapsible = false }: { slug: string; name: string; collapsible?: boolean }) {
  const dir = getLguDirectory(slug);
  if (!dir || !dir.offices.length) return null;
  return <LguDirectoryView dir={dir} name={name} collapsible={collapsible} />;
}
