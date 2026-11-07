// UI revamp slot D: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const UXD = {
  "uxd.src.h": ["Sources", "Mga pinagmulan"],
  "uxd.story.switch": ["Read another story", "Basahin ang ibang kuwento"],
  // budget checks (Filipino drafts await native-speaker review). A flag is a pointer to look closer, not an allegation.
  "uxd.chk.h": ["Checks on this budget", "Mga tsek sa badyet na ito"],
  "uxd.chk.totals.ok": ["The two totals match", "Magkapareho ang dalawang kabuuan"],
  "uxd.chk.totals.hi": ["The House bill is {0} higher than the NEP", "Ang House bill ay {0} na mas mataas kaysa sa NEP"],
  "uxd.chk.totals.lo": ["The House bill is {0} lower than the NEP", "Ang House bill ay {0} na mas mababa kaysa sa NEP"],
  "uxd.chk.totals.unk": ["One of the totals is not available, so they cannot be compared", "Wala ang isa sa mga kabuuan, kaya hindi maihambing"],
  "uxd.chk.proj.ok": ["Both versions list {0} projects", "Parehong may {0} proyekto ang dalawang bersyon"],
  "uxd.chk.proj.flag": ["The NEP lists {0} projects, the House bill {1}", "May {0} proyekto ang NEP, {1} ang House bill"],
  "uxd.chk.unc.ok": ["Every line was matched with confidence", "Lahat ng linya ay tiyak na naitugma"],
  "uxd.chk.unc.flag": ["{0} lines ({1}) could not be matched with confidence", "{0} linya ({1}) ang hindi tiyak na naitugma"],
  "uxd.chk.flag": ["Look closer", "Tingnan nang mabuti"], "uxd.chk.okl": ["Consistent", "Tugma"], "uxd.chk.unk": ["Unknown", "Hindi alam"],
  "uxd.chk.note": ["A flag means the versions differ or a match is uncertain. It is not an allegation.", "Ang flag ay nangangahulugang magkaiba ang mga bersyon o hindi tiyak ang tugma. Hindi ito paratang."],
} as const satisfies Record<string, readonly [string, string]>;
