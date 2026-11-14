import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SiteShell from "@/components/site/SiteShell";
import { SITE } from "@/lib/brand";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

const DESC = "A volunteer-led civic website for Oriental Mindoro: services, hotlines, projects and the MaHalTaNa story.";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: DESC,
  openGraph: { title: SITE.name, description: DESC, siteName: SITE.name, type: "website", locale: "en_PH" },
  twitter: { card: "summary_large_image", title: SITE.name, description: DESC },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
