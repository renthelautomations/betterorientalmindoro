"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="font-serif text-4xl font-bold">May nangyaring mali.</h1>
      <p className="mt-4 text-lg text-black/70">Something went wrong on our side. Please try again.</p>
      <button onClick={reset} className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--navy)] px-6 text-sm font-semibold text-white">Subukan muli</button>
    </main>
  );
}
