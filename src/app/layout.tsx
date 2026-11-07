import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import EmergencyBar from "@/components/EmergencyBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/brand";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

const DESC = "A volunteer-led civic website for Oriental Mindoro: services, hotlines, projects and the MaHalTaNa story.";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: DESC,
  openGraph: { title: SITE.name, description: DESC, siteName: SITE.name, type: "website", locale: "en_PH" },
  twitter: { card: "summary", title: SITE.name, description: DESC },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:p-3 focus:underline">Skip to content</a>
        <EmergencyBar />
        <Header />
        <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
