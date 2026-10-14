import type { Messages } from "@/lib/i18n";

/**
 * Conteúdo da mesa: textos vêm do namespace `desk` (i18n); links, imagens e
 * ordem ficam aqui, porque não mudam com o idioma.
 */

export const DESK_SECTIONS = [
  "about",
  "projects",
  "career",
  "inspirations",
  "tools",
  "now",
  "football",
  "contact",
  "notebook",
] as const;

export type DeskSectionKey = (typeof DESK_SECTIONS)[number];

export interface DeskItem {
  id: string;
  label: string;
  short: string;
  title: string;
  text: string;
  meta: string;
  href: string;
  cta: string;
  image: string;
}

export type DeskContent = Record<DeskSectionKey, DeskItem[]>;

export type DeskMessages = Messages["desk"];
type RawContent = DeskMessages["content"];

interface ItemExtras {
  href?: string;
  image?: string;
}

const LINKS = {
  matchMoment: "https://match-moment.com",
  itoOnline: "https://playito.io",
  barcaApi: "https://api.fc-barcelona.app",
  huntspace: "https://huntspace.dev",
  bugCapitalist: "https://github.com/RaphaelOliveiraMoura/bugcap",
  barcelonaApp: "https://fc-barcelona.app",
  linkedin: "https://www.linkedin.com/in/raphaeloliveiramoura/",
  github: "https://github.com/RaphaelOliveiraMoura",
  email: "mailto:raphael.moura0208@gmail.com",
} as const;

const PROJECT_IMAGES = {
  matchMoment: "/images/projects/match-moment.png",
  itoOnline: "/images/projects/ito-online.png",
  barcaApi: "/images/projects/barca-api.png",
  huntspace: "/images/projects/huntspace.png",
  bugCapitalist: "/images/projects/bug-capitalist.png",
  barcelonaApp: "/images/projects/barcelona-app.png",
} as const;

const EXTRAS: {
  [S in keyof RawContent]: { [K in keyof RawContent[S]]: ItemExtras };
} = {
  about: { who: {}, today: {}, leadership: {}, "spare-time": {} },
  projects: {
    "match-moment": {
      href: LINKS.matchMoment,
      image: PROJECT_IMAGES.matchMoment,
    },
    "ito-online": { href: LINKS.itoOnline, image: PROJECT_IMAGES.itoOnline },
    "barca-api": { href: LINKS.barcaApi, image: PROJECT_IMAGES.barcaApi },
    huntspace: { href: LINKS.huntspace, image: PROJECT_IMAGES.huntspace },
    "bug-capitalist": {
      href: LINKS.bugCapitalist,
      image: PROJECT_IMAGES.bugCapitalist,
    },
    "barcelona-app": {
      href: LINKS.barcelonaApp,
      image: PROJECT_IMAGES.barcelonaApp,
    },
  },
  career: {
    boticario: { href: LINKS.linkedin },
    "nata-lead": {},
    "nata-dev": {},
    una: {},
    "kukac-dev": {},
    "kukac-intern": {},
  },
  inspirations: {
    branas: { image: "/images/recommendations/recomendations_branas.jpeg" },
    "elemar-jr": {
      image: "/images/recommendations/recomendations_elemar_jr.jpeg",
    },
    "fabio-akita": {
      image: "/images/recommendations/recomendations_fabio_akita.jpeg",
    },
    manguinho: {
      image: "/images/recommendations/recomendations_manguinho.jpeg",
    },
    "filipe-deschamps": {
      image: "/images/recommendations/recomendations_filipe_deschamps.jpg",
    },
    "erick-wendel": {
      image: "/images/recommendations/recomendations_erick_wendel.jpeg",
    },
    "lucas-montano": {
      image: "/images/recommendations/recomendations_lucas_montano.jpeg",
    },
    "mario-solto": {
      image: "/images/recommendations/recomendations_mario_solto.jpg",
    },
    rocketseat: {
      image: "/images/recommendations/recomendations_rocketseat.jpg",
    },
  },
  tools: {
    typescript: {},
    react: {},
    nextjs: {},
    nodejs: {},
    nestjs: {},
    postgresql: {},
    aws: {},
    docker: {},
  },
  now: { working: {}, building: {}, studying: {}, reading: {} },
  football: {
    fan: {},
    "match-moment": {
      href: LINKS.matchMoment,
      image: PROJECT_IMAGES.matchMoment,
    },
    "barca-api": { href: LINKS.barcaApi, image: PROJECT_IMAGES.barcaApi },
    "barcelona-app": {
      href: LINKS.barcelonaApp,
      image: PROJECT_IMAGES.barcelonaApp,
    },
  },
  contact: {
    email: { href: LINKS.email },
    linkedin: { href: LINKS.linkedin },
    github: { href: LINKS.github },
    // TODO(conteudo): publicar o PDF do currículo e apontar o link aqui.
    cv: {},
  },
  notebook: { activity: {}, terminal: {} },
};

interface RawItem {
  label?: string;
  short?: string;
  title: string;
  text: string;
  meta?: string;
  cta?: string;
  pending?: boolean;
}

interface SectionDefaults {
  label?: string;
}

function toItems(
  raw: Record<string, RawItem>,
  extras: Record<string, ItemExtras>,
  defaults: SectionDefaults = {},
): DeskItem[] {
  return Object.entries(extras).flatMap(([id, extra]) => {
    const item = raw[id];
    if (!item || item.pending) return [];
    return [
      {
        id,
        label: item.label ?? defaults.label ?? "",
        short: item.short ?? item.title.split(" ")[0] ?? item.title,
        title: item.title,
        text: item.text,
        meta: item.meta ?? "",
        href: extra.href ?? "",
        cta: item.cta ?? "",
        image: extra.image ?? "",
      },
    ];
  });
}

export function buildDeskContent(messages: DeskMessages): DeskContent {
  const raw = messages.content;
  return {
    about: toItems(raw.about, EXTRAS.about),
    projects: toItems(raw.projects, EXTRAS.projects),
    career: toItems(raw.career, EXTRAS.career),
    inspirations: toItems(raw.inspirations, EXTRAS.inspirations, {
      label: messages.canvas.inspiration,
    }),
    tools: toItems(raw.tools, EXTRAS.tools),
    now: toItems(raw.now, EXTRAS.now),
    football: toItems(raw.football, EXTRAS.football),
    contact: toItems(raw.contact, EXTRAS.contact),
    notebook: toItems(raw.notebook, EXTRAS.notebook),
  };
}
