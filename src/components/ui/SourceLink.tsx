import Icon, { type IconName } from "./Icon";

// A source/reference link: context icon + label + external arrow. Opens in a new tab.
export default function SourceLink({ href, icon, children }: { href: string; icon: IconName; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 text-sm font-medium text-[var(--navy)] hover:border-[var(--navy)] hover:bg-black/[0.03]"
    >
      <Icon name={icon} />
      {children}
      <Icon name="external" className="h-3.5 w-3.5 opacity-60" />
    </a>
  );
}
