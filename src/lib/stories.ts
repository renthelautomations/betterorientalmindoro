import type { IconKey } from "./brand";

export type Story = { title: string; draft: boolean; paragraphs: string[]; link?: { href: string; label: string } };

// Draft copy: factual, from published sources; volunteers must verify before launch.
export const STORIES_EN: Record<IconKey, Story> = {
  ma: {
    title: "Mangyan",
    draft: false,
    paragraphs: [
      "The Mangyan are the indigenous peoples of Mindoro, made up of several distinct groups with their own languages and traditions.",
      "This page is in preparation. We will publish Mangyan stories, language and culture only together with Mangyan communities and with their approval and credit.",
    ],
  },
  hal: {
    title: "Mount Halcon",
    draft: true,
    paragraphs: [
      "Mount Halcon is the highest peak in Mindoro, about 2,580 meters above sea level, and one of the highest in the Philippines. It is known as a demanding trek.",
      "Climbers should arrange guides and permits through local offices, and check weather and advisories before going.",
    ],
  },
  ta: {
    title: "Tamaraw",
    draft: true,
    paragraphs: [
      "The tamaraw (Bubalus mindorensis) is a small wild buffalo found only on Mindoro. It is critically endangered, with a population counted in the hundreds.",
      "Protecting its habitat is one of the province's most important conservation efforts.",
    ],
  },
  na: {
    title: "Naujan Lake",
    draft: true,
    paragraphs: [
      "Naujan Lake is the largest lake in the province and part of Naujan Lake National Park, a protected wetland of national and international importance.",
      "It supports fishing communities and a rich variety of birds and aquatic life, and it is also a flood-prone area.",
    ],
    link: { href: "https://noah.up.edu.ph", label: "See hazard maps on Project NOAH" },
  },
};

/** English version; kept under the old name for pages that have not moved to the two-version pair yet. */
export const STORIES = STORIES_EN;

// Filipino version: a faithful first draft for native-speaker review.
export const STORIES_FIL: Record<IconKey, Story> = {
  ma: {
    title: "Mangyan",
    draft: false,
    paragraphs: [
      "Ang mga Mangyan ang mga katutubo ng Mindoro, na binubuo ng ilang magkakaibang grupo na may kani-kanilang wika at tradisyon.",
      "Inihahanda pa ang pahinang ito. Ilalathala lamang namin ang mga kuwento, wika, at kultura ng mga Mangyan kasama ng mga komunidad ng Mangyan at may kanilang pahintulot at pagkilala.",
    ],
  },
  hal: {
    title: "Bundok Halcon",
    draft: true,
    paragraphs: [
      "Ang Bundok Halcon ang pinakamataas na tuktok sa Mindoro, mga 2,580 metro ang taas mula sa antas ng dagat, at isa sa pinakamataas sa Pilipinas. Kilala ito bilang mahirap na akyatan.",
      "Dapat ayusin ng mga aakyat ang guide at permit sa mga lokal na tanggapan, at tingnan ang lagay ng panahon at mga abiso bago umalis.",
    ],
  },
  ta: {
    title: "Tamaraw",
    draft: true,
    paragraphs: [
      "Ang tamaraw (Bubalus mindorensis) ay isang maliit na ligaw na kalabaw na matatagpuan lamang sa Mindoro. Lubhang nanganganib ito, at daan-daan na lamang ang bilang.",
      "Ang pangangalaga sa tirahan nito ay isa sa pinakamahalagang pagsisikap sa konserbasyon ng lalawigan.",
    ],
  },
  na: {
    title: "Lawa ng Naujan",
    draft: true,
    paragraphs: [
      "Ang Lawa ng Naujan ang pinakamalaking lawa sa lalawigan at bahagi ng Naujan Lake National Park, isang protektadong wetland na mahalaga sa bansa at sa buong mundo.",
      "Nagbibigay ito ng kabuhayan sa mga pamayanang mangingisda at tirahan ng samu't saring ibon at buhay-tubig, at madali rin itong bahain.",
    ],
    link: { href: "https://noah.up.edu.ph", label: "Tingnan ang hazard maps sa Project NOAH" },
  },
};
