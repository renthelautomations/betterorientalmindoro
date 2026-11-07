export type Service = {
  id: string; // also the URL slug
  category: string;
  title: string;
  summary: string;
  office?: string;
  hours?: string;
  fee?: string;
  processing?: string;
  who?: string;
  requirements?: string[];
  steps?: string[];
  notes?: string[];
  contact?: string;
  source: string;
  sourceNote?: string;
  checkedAt: string; // YYYY-MM-DD the source was read
  draft: true; // shown as "Draft: para sa review ng volunteers"
};
export type ServiceCategory = { slug: string; name: string; blurb: string };
export type LifeEvent = { slug: string; name: string; blurb: string; serviceIds: string[] };

import { CATEGORIES, EVENTS, SERVICES } from "@/data/services";

export const getCategories = (): ServiceCategory[] => CATEGORIES;
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getServices = (category?: string): Service[] => (category ? SERVICES.filter((s) => s.category === category) : SERVICES);
export const getService = (category: string, id: string) => SERVICES.find((s) => s.category === category && s.id === id);
export const getLifeEvents = (): LifeEvent[] => EVENTS;
export const servicesForEvent = (slug: string): Service[] =>
  (EVENTS.find((e) => e.slug === slug)?.serviceIds ?? []).flatMap((id) => SERVICES.filter((s) => s.id === id));
