// UI revamp slot C: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const UXC = {
  "uxc.vsbig": ["Bar compares with the biggest town", "Ihinahambing ng bar sa pinakamalaking bayan"],
  "uxc.vsprov": ["Bar shows the share of the province", "Ipinapakita ng bar ang bahagi ng lalawigan"],
  "uxc.fin.h": ["Local finances", "Pananalapi ng bayan"],
  "uxc.land.h": ["Land and barangays", "Lupa at mga barangay"],
  "uxc.hub.jump": ["Jump to a town", "Pumunta sa bayan"],
  "uxc.hub.big": ["Largest towns by population", "Pinakamalalaking bayan ayon sa populasyon"],
  "uxc.hub.hint": ["Tap a town on the map, or choose from the list.", "Pindutin ang bayan sa mapa, o pumili sa listahan."],
  "uxc.hub.cta": ["Open town page", "Buksan ang pahina ng bayan"],
} as const satisfies Record<string, readonly [string, string]>;
