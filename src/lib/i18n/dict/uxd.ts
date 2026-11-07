// UI revamp slot D: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const UXD = {
  "uxd.src.h": ["Sources", "Mga pinagmulan"],
  "uxd.story.switch": ["Read another story", "Basahin ang ibang kuwento"],
} as const satisfies Record<string, readonly [string, string]>;
