import type { IconKey } from "./brand";

export type Story = { title: string; draft: boolean; paragraphs: string[]; link?: { href: string; label: string } };

// Draft copy: factual, from published sources; volunteers must verify before launch.
export const STORIES: Record<IconKey, Story> = {
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
