/** Dictionary key for a position (MAYOR, "VICE MAYOR", COUNCILOR). Plain module so server and client can both call it. */
export const posKey = (p: string, pre = "dyn.pos.") => pre + p.toLowerCase().replace(" ", "-");
