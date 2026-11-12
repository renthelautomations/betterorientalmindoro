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
import { UXA } from "./dict/uxa";
import { UXB } from "./dict/uxb";
import { UXC } from "./dict/uxc";
import { UXD } from "./dict/uxd";
import { MENU } from "./dict/menu";
import { RF } from "./dict/redflags";
import { GOVA } from "./dict/gova";
import { GOVB } from "./dict/govb";
import { GOVC } from "./dict/govc";
import { LGU } from "./dict/lgu";
import { VOL } from "./dict/vol";

export const DICT = { ...BASE, ...HOME, ...BAYAN, ...PROYEKTO, ...FINANCE, ...DYN, ...ESTAT, ...DOCS, ...UXA, ...UXB, ...UXC, ...UXD, ...MENU, ...RF, ...GOVA, ...GOVB, ...GOVC, ...LGU, ...VOL } as const satisfies Record<string, readonly [string, string]>;
export type DictKey = keyof typeof DICT;
