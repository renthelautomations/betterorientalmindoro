import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { tidy } from "@/lib/office-format";

const pillBase = "inline-flex min-h-10 w-full items-center gap-2 rounded-full px-4 text-sm font-semibold";
/** Office list row: icon, name with head and address, then two fixed columns (call, email) so every row lines up the same way. */
export default function OfficeRow({ icon, color, bg, name, head, address, phones, emails, dial = (n: string) => "tel:" + n.replace(/[^\d+]/g, "") }: {
  icon: KitIconName; color: string; bg: string; name: string; head?: string | null; address?: string | null; phones: string[]; emails: string[]; dial?: (n: string) => string;
}) {
  return (
    <li className="grid items-center gap-x-4 gap-y-3 p-4 md:grid-cols-[2.75rem_minmax(0,1fr)_13rem_17rem]">
      <span className="hidden h-11 w-11 items-center justify-center rounded-full md:flex" style={{ background: bg }} aria-hidden><KitIcon name={icon} color={color} className="h-6 w-6" /></span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug text-fiesta-navy">{name}</p>
        {head && <p className="text-sm text-black/70">{head}</p>}
        {address && <p className="mt-0.5 flex items-start gap-1 text-xs text-black/65"><KitIcon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0" />{tidy(address)}</p>}
      </div>
      <div className="flex flex-col gap-2">
        {phones.map((n) => <a key={n} href={dial(n)} className={`${pillBase} bg-fiesta-navy whitespace-nowrap text-white hover:bg-fiesta-blue`}><KitIcon name="phone" className="h-4 w-4 shrink-0" />{n}</a>)}
      </div>
      <div className="flex flex-col gap-2">
        {emails.map((e) => <a key={e} href={`mailto:${e}`} title={e} className={`${pillBase} bg-fiesta-navy/5 text-fiesta-blue hover:bg-fiesta-mint`}><svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg><span className="truncate">{e}</span></a>)}
      </div>
    </li>
  );
}
