/** Public site origin: explicit setting, else the Vercel production domain, else local dev. No trailing slash. */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const base = env.NEXT_PUBLIC_SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return base.replace(/\/+$/, "");
}
