// Typed access to the committed snapshot of https://ormindoro.gov.ph (src/data/gov/*.json, written by scripts/fetch-gov.mjs).
// PDFs are not re-hosted: `url` fields are links to the official site.
import procurement from "@/data/gov/procurement.json";
import eo from "@/data/gov/eo.json";
import reports from "@/data/gov/reports.json";
import careers from "@/data/gov/careers.json";
import news from "@/data/gov/news.json";
import officials from "@/data/gov/officials.json";
import investment from "@/data/gov/investment.json";
import facts from "@/data/gov/facts.json";
import { parseEo as parseEoRaw, workClass as workClassRaw } from "./gov-pure.mjs";

export type Dataset<T> = { source: string; fetchedAt: string; items: T[] };

export type WorkClass = "road" | "building" | "bridge" | "drainage" | "water" | "other";
export type ProcurementType = "itb" | "rfq" | "reso" | "po" | "noa" | "coa" | "ntp" | "ppp";
export type Procurement = { id: string; refNo: string | null; type: ProcurementType; title: string; date: string | null; url: string | null; town: string | null; work: WorkClass };
export type Eo = { id: string; number: number | null; suffix: string | null; year: number | null; label: string; title: string | null; date: string | null; url: string | null };
export type ReportKind = "supplemental-budget" | "lgsf" | "other" | "assistance";
export type Report = { id: string; date: string | null; title: string; kind: ReportKind; url: string | null };
export type Career = {
  id: string; position: string; itemNo: string | null; salaryGrade: string | null; monthlySalary: number | null;
  education: string | null; training: string | null; experience: string | null; eligibility: string | null; competency: string | null;
  office: string | null; deadline: string | null; url: string | null;
};
export type NewsItem = { id: string; title: string; link: string; date: string | null; language: "fil" | "en"; summary: string | null };
export type OfficialKind = "governor" | "vice-governor" | "board-member" | "sectoral" | "sp-secretary" | "department-head" | "office";
export type Official = { id: string; kind: OfficialKind; name: string | null; position: string | null; office: string | null; phone: string | null; location: string | null; email: string | null };
export type InvestmentSector = { id: string; n: number; sector: string; note: string | null; opportunities: string; why: string };
export type Fact = { key: string; label: string; value: number | null; unit: string };

export const getProcurement = () => procurement as Dataset<Procurement>;
export const getEo = () => eo as Dataset<Eo>;
export const getReports = () => reports as Dataset<Report>;
export const getCareers = () => careers as Dataset<Career>;
export const getNews = () => news as Dataset<NewsItem>;
export const getOfficials = () => officials as Dataset<Official>;
export const getInvestment = () => investment as Dataset<InvestmentSector>;
export const getFacts = () => facts as Dataset<Fact>;

/** Coarse class of a procurement title by keyword rules (see gov-pure.mjs). */
export const workClass = workClassRaw as (title: string) => WorkClass;
/** "Executive Order No. 61 Series of 2026" -> { number: 61, suffix: null, year: 2026 }. */
export const parseEo = parseEoRaw as (title: string) => { number: number | null; suffix: string | null; year: number | null };

const count = <T,>(xs: T[], key: (x: T) => string | null) => {
  const m: Record<string, number> = {};
  for (const x of xs) {
    const k = key(x);
    if (k) m[k] = (m[k] ?? 0) + 1;
  }
  return m;
};

/** Procurement rows per municipality slug (rows with no single town are skipped). Pass a type to count one document type only. */
export const procurementByTown = (items: Procurement[] = getProcurement().items, type?: ProcurementType) =>
  count(type ? items.filter((x) => x.type === type) : items, (x) => x.town);

/** Procurement rows per "YYYY-MM" (rows with no date are skipped), keys in ascending order. */
export const procurementByMonth = (items: Procurement[] = getProcurement().items, type?: ProcurementType) => {
  const m = count(type ? items.filter((x) => x.type === type) : items, (x) => x.date?.slice(0, 7) ?? null);
  return Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
};

/** Years that have executive orders, newest first, with counts. */
export const eoYears = (items: Eo[] = getEo().items) =>
  Object.entries(count(items, (x) => (x.year ? String(x.year) : null)))
    .map(([year, n]) => ({ year: Number(year), n }))
    .sort((a, b) => b.year - a.year);
