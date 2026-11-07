import type { Metadata } from "next";
import { ErrorState } from "@/components/kit/Ui";

export const metadata: Metadata = { title: "404 template (draft)", robots: { index: false } };

export default function NotFoundDemo() {
  return (
    <main>
      <ErrorState code="404" title="Hindi namin mahanap ang pahinang ito" links={[{ label: "Bumalik sa home", href: "/" }, { label: "Mga bayan", href: "/bayan" }, { label: "Mga hotline", href: "/hotlines" }]}>
        Maaaring nailipat o hindi na umiiral ang link. Subukan ang mga ito.
      </ErrorState>
    </main>
  );
}
