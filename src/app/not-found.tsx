import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-sm font-semibold tracking-widest text-[var(--ma)]">404</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Hindi namin mahanap ang pahinang ito.</h1>
      <p className="mt-4 text-lg text-black/70">Page not found. It may have moved, or the link may be mistyped.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-[var(--navy)] px-6 text-sm font-semibold text-white">Bumalik sa home</Link>
        <Link href="/bayan" className="inline-flex min-h-11 items-center rounded-full border border-black/20 px-6 text-sm font-medium">Mapa ng mga bayan</Link>
      </div>
    </main>
  );
}
