import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { href: "/bayan", label: "Bayan" },
  { href: "/hotlines", label: "Serbisyo" },
  { href: "/bayan", label: "Mapa" },
];

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Better Oriental Mindoro, home"><Logo /></Link>
        <nav aria-label="Main" className="flex gap-5 text-sm font-medium">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="hover:underline">{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
