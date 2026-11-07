// EN / FIL strings: the design kit's base dictionary plus one file per site area.
// [English, Filipino]. Data content (service names, hotline names, officeholders, project titles) stays in its source language.
import { BASE } from "./dict/base";
import { HOME } from "./dict/home";
import { BAYAN } from "./dict/bayan";
import { PROYEKTO } from "./dict/proyekto";
import { FINANCE } from "./dict/finance";
import { DYN } from "./dict/dyn";
import { ESTAT } from "./dict/estat";
import { DOCS } from "./dict/docs";

export const DICT = { ...BASE, ...HOME, ...BAYAN, ...PROYEKTO, ...FINANCE, ...DYN, ...ESTAT, ...DOCS } as const satisfies Record<string, readonly [string, string]>;
export type DictKey = keyof typeof DICT;
