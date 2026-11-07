import Link from "next/link";
import Logo from "./Logo";

// Add a route here and it appears in the header; the nav wraps on narrow screens.
export const NAV = [
  { href: "/bayan", label: "Bayan" },
  { href: "/hotlines", label: "Hotlines" },
  { href: "/proyekto", label: "Proyekto" },
];

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 py-2">
        <Link href="/" aria-label="Better Oriental Mindoro, home" className="py-2"><Logo /></Link>
        <nav aria-label="Main">
          <ul className="-mx-3 flex flex-wrap text-sm font-medium">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center px-3 hover:underline">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
