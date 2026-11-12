import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import TownEmblem from "@/components/kit/TownEmblem";
import { CopyButton } from "@/components/kit/Interactive";
import { Badge } from "@/components/kit/Parts";
import { T } from "@/lib/i18n/i18n";
import { getLguContact } from "@/lib/lgu-contacts";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");
const bare = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** One tappable tile: colored icon badge, small label, bold value. Filled, no outline or edge bar. */
function Tile({ href, icon, color, label, value }: { href: string; icon: KitIconName; color: string; label: React.ReactNode; value: string }) {
  return (
    <a href={href} rel="noopener" className="group flex min-h-16 items-center gap-3 rounded-xl bg-fiesta-cream p-3 transition-colors hover:bg-fiesta-navy/10">
      <KitIcon name={icon} variant="badge" color={color} className="h-10 w-10 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold tracking-wider text-black/60">{label}</span>
        <span className="block truncate font-semibold text-fiesta-navy group-hover:text-fiesta-blue">{value}</span>
      </span>
      <KitIcon name="arrow" className="h-4 w-4 shrink-0 text-black/65 group-hover:text-fiesta-blue" />
    </a>
  );
}

/** Opisyal na kontak at pahina ng isang LGU: tawag, email, website, Facebook. Renders nothing for an unknown slug. */
export default function LguContactCard({ slug, name }: { slug: string; name: string }) {
  const c = getLguContact(slug);
  if (!c) return null;
  const phones = [...c.landline, ...c.mobile];
  return (
    <section aria-label={`Opisyal na kontak ng ${name}`} className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-4 bg-fiesta-mint/60 px-5 py-4 sm:px-6">
        <TownEmblem slug={slug} name={name} className="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-fiesta-orange-deep"><T k="lgu.eyebrow" /></p>
          <h3 className="font-serif text-xl font-bold leading-tight">{name}</h3>
        </div>
        <Badge kind="verified"><T k="common.verified" /></Badge>
      </header>

      <div className="space-y-6 p-5 sm:p-6">
        {phones.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold"><T k="lgu.call" /></p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {phones.map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <a href={tel(n)} className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-fiesta-navy px-3 font-serif text-lg font-bold whitespace-nowrap text-white hover:bg-fiesta-blue">
                    <KitIcon name="phone" className="h-5 w-5" />{n}
                  </a>
                  <CopyButton text={n} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-3 text-sm font-semibold"><T k="lgu.online" /></p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.email.map((e) => <li key={e}><Tile href={`mailto:${e}`} icon="mail" color="#2b4fa3" label={<T k="lgu.email" />} value={e} /></li>)}
            {c.website && <li><Tile href={c.website} icon="globe" color="#2a7f44" label={<T k="lgu.website" />} value={bare(c.website)} /></li>}
            {c.facebook.map((f) => <li key={f.url}><Tile href={f.url} icon="people" color="#c4431a" label={<T k="lgu.facebook" />} value={f.label} /></li>)}
          </ul>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-fiesta-navy/[0.03] px-5 py-3 text-xs text-black/65 sm:px-6">
        <a href={c.source} rel="noopener" className="inline-flex min-h-11 items-center underline"><T k="common.source" /></a>
        {c.extraSources?.map((x) => <a key={x.url} href={x.url} rel="noopener" className="inline-flex min-h-11 items-center underline">{x.label}</a>)}
        <span><T k="common.checked" /> {c.verifiedAt}</span>
        <span><T k="lgu.note" /></span>
      </footer>
    </section>
  );
}
