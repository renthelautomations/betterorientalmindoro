"use client";
import { useLang } from "./i18n";

/** Two whole versions of a long page, chosen by language (docs/i18n-toggle.md: long-form pages are translated as documents, not strings). Server HTML is Filipino, like the rest of the toggle. */
export default function Bilingual({ en, fil }: { en: React.ReactNode; fil: React.ReactNode }) {
  return <>{useLang() === "en" ? en : fil}</>;
}
