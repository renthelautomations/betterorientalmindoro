import eoDocs from "@/data/gov/eo-docs.json";
import reportDocs from "@/data/gov/reports-docs.json";

/** Summaries read from the SCANNED official PDFs (OCR). They are aids to find the right document, not the document: always link the official PDF and say so. */
export type DocEvidence = { page: number; quote: string };
export type Confidence = "high" | "medium" | "low";

export type EoTopic = "organization" | "appointment" | "finance" | "health" | "disaster" | "environment" | "agriculture" | "tourism" | "education" | "peace-order" | "other";
export type EoDoc = {
  id: string; number: number; year: number;
  summary: string; summaryFil: string;
  topic: EoTopic;
  signedDate: string | null;      // ISO date as printed on the order, else null
  amends: string[]; repeals: string[]; // labels of other orders it names, e.g. "Executive Order No. 59, Series of 2020"
  keyPoints: string[];            // at most 4 short bullets, from the text only
  pageCount: number; confidence: Confidence; evidence: DocEvidence[];
};
export type ReportDoc = {
  id: string; kind: "supplemental-budget" | "lgsf" | "other" | "assistance";
  summary: string; summaryFil: string;
  totalAmount: number | null; amountLabel: string | null; // what the amount is, as printed (e.g. "Supplemental Budget No. 4")
  purposes: string[]; fundSource: string | null; period: string | null; // period as printed (e.g. "as of September 30, 2026")
  pageCount: number; confidence: Confidence; evidence: DocEvidence[];
};
type Dataset<T> = { source: string; fetchedAt: string | null; items: T[] };

export const getEoDocs = () => (eoDocs as unknown as Dataset<EoDoc>).items;
export const getEoDoc = (id: string) => getEoDocs().find((d) => d.id === id);
export const getReportDocs = () => (reportDocs as unknown as Dataset<ReportDoc>).items;
export const getReportDoc = (id: string) => getReportDocs().find((d) => d.id === id);
