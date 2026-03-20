export type FicStatus = "Ongoing" | "Complete" | "Hiatus";

export const TAG_OPTIONS = [
  "Angst", "Fluff", "Hurt/Comfort", "Whump", "Bittersweet", "Happy ending",
  "Comfort", "Dark", "Slow burn", "Enemies to lovers", "Friends to lovers",
  "Fake dating", "Only one bed", "Second chance", "Forbidden romance",
  "Grumpy/Sunshine", "Idiots in love", "Pining", "Domestic", "Found family",
  "Canon compliant", "Canon divergence", "Fix-it", "Post-canon", "Missing scene",
  "Alternate universe (AU)", "College/University AU", "Modern AU", "Historical AU",
  "Celebrity AU", "Workplace AU", "Friends with benefits AU", "Smut", "No smut",
  "Explicit", "Suggestive", "Fade to black", "BDSM", "Healing", "Trauma recovery",
  "Mental health", "Family", "Jealousy", "Miscommunication", "Identity",
  "Politics", "One-shot", "Multi-chapter", "POV: Alternating", "Flashbacks",
] as const;

export type TagOption = (typeof TAG_OPTIONS)[number];

export type Fic = {
  title: string;
  author: string;
  tags: TagOption[];
  status: FicStatus;
  chapterCurrent: number | null;
  chapterTotal: number | null;
  ratingAvg: number;
  votes: number;
  summary: string;
  ao3Url?: string;
  year?: number;
};

export type AuthorQuote = {
  author: string;
  quote: string;
  socials?: { platform: string; url: string }[]; // Adicionado para os links de perfil
};

/* export const MOCK_AUTHOR_QUOTES: AuthorQuote[] = [
  { 
    author: "TLTLY_86", 
    quote: "Softness can be a weapon too.",
    socials: [
      { platform: "AO3", url: "https://archiveofourown.org/users/TLTLY_86" },
      {platform: "X/Twitter", url: "https://x.com/TLTLY_86"}
    ]},
  { author: "Melted_Marshmallow",
    quote: "I write kisses like they’re spells.", 
    socials: [
      {platform: "X/Twitter", url: "https://x.com/marydiana1m"}, 
      {platform: "AO3", url: "https://archiveofourown.org/users/Melted_Marshmallow"}
    ]},
  { author: "undisclosed_desire", 
    quote: "Chaos first. Feelings later.",
    socials: [
      {platform: "X/Twitter", url: "https://x.com/biomerveporter"},
      {platform: "AO3", url: "https://archiveofourown.org/users/undisclosed_desire"}
    ]},
  { author: "Liquid_Heat", 
    quote: "Domestic bliss… with teeth.",
    socials: [
      {platform: "X/Twitter", url: "https://x.com/heat_liquid"}, 
      {platform: "AO3", url: "https://archiveofourown.org/users/Liquid_Heat"}
    ]},
  { 
    author: "WhispersFromThePlanet", 
    quote: "Let it hurt. Then let it heal.",
    socials: [
        { platform: "Twitter", url: "https://twitter.com" },
        { platform: "AO3", url: "https://archiveofourown.org" }
    ]},
  { 
    author: "sparepartsandbrokenhearts", 
    quote: "Hm.",
    socials: [
        { platform: "Twitter", url: "https://x.com/spareparts_bh" },
        { platform: "AO3", url: "https://archiveofourown.org/users/sparepartsandbrokenhearts" }
    ]},
];

export const MOCK_FICS: Fic[] = [
  {
    title: "The maps of what we lost",
    author: "WhispersFromThePlanet",
    tags: ["Angst", "Canon compliant", "Found family", "Bittersweet"],
    status: "Ongoing",
    chapterCurrent: 81,
    chapterTotal: null,
    ratingAvg: 4.9,
    votes: 456,
    summary: "An intimate canon-era story about love, family, and everything Tibette keeps losing and rebuilding along the way.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/64930945",
  },
  {
    title: "Lingering touches and silent promises",
    author: "Melted_Marshmallow",
    tags: ["Fluff", "Smut", "Happy ending", "Domestic"],
    status: "Complete",
    chapterCurrent: 1,
    chapterTotal: 1,
    ratingAvg: 5,
    votes: 546,
    summary: "Soft domestic tenderness, quiet devotion, and the kind of one-shot that makes you want to stay in their world a little longer.",
    year: 2023,
    ao3Url: "https://archiveofourown.org/works/79022201",
  },
  {
    title: "Red, White, and You",
    author: "sparepartsandbrokenhearts",
    tags: ["Angst", "Slow burn", "Enemies to lovers", "Canon divergence"],
    status: "Ongoing",
    chapterCurrent: 3,
    chapterTotal: null,
    ratingAvg: 5.0,
    votes: 443,
    summary: "A charged slow burn with rivalry, tension, and the delicious feeling that every scene is building toward something impossible to ignore.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/77275116",
  },
  {
    title: "Every Single Day",
    author: "TLTLY_86",
    tags: ["Fluff", "Domestic", "Happy ending"],
    status: "Complete",
    chapterCurrent: 1,
    chapterTotal: 1,
    ratingAvg: 5,
    votes: 394,
    summary: "Warm, comforting, and romantic — the kind of fic you open when you want Tibette happiness without emotional whiplash.",
    year: 2022,
    ao3Url: "https://archiveofourown.org/works/78899486",
  },
  {
    title: "After the Applause",
    author: "intothedaylightss",
    tags: ["Slow burn", "Enemies to lovers", "Hurt/Comfort", "Bittersweet"],
    status: "Ongoing",
    chapterCurrent: 6,
    chapterTotal: null,
    ratingAvg: 4.9,
    votes: 349,
    summary: "An emotional enemies-to-lovers setup with performance, vulnerability, and a beautifully aching pace.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/77336311",
  },
  {
    title: "A New York Snow Storm",
    author: "undisclosed_desire",
    tags: ["Alternate universe (AU)", "Enemies to lovers", "Smut", "Happy ending"],
    status: "Ongoing",
    chapterCurrent: 17,
    chapterTotal: null,
    ratingAvg: 5,
    votes: 500,
    summary: "A snowy AU full of chemistry, banter, and the kind of romantic chaos that makes you instantly commit to the premise.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/55107451",
  },
  {
    title: "Out of the Dark",
    author: "TinaAndBetteTibette",
    tags: ["Hurt/Comfort", "Happy ending", "Found family", "Canon divergence"],
    status: "Complete",
    chapterCurrent: 11,
    chapterTotal: 11,
    ratingAvg: 4.7,
    votes: 479,
    summary: "Healing, found family, and emotional payoff make this a comforting pick for readers who want pain with a hopeful landing.",
    year: 2021,
    ao3Url: "https://archiveofourown.org/works/78729131",
  },
  {
    title: "Lit-mas gift",
    author: "Liquid_Heat",
    tags: ["Fluff", "Domestic", "Happy ending"],
    status: "Complete",
    chapterCurrent: 1,
    chapterTotal: 1,
    ratingAvg: 4.9,
    votes: 469,
    summary: "A festive, cozy recommendation with domestic sweetness and an easy charm that feels perfect for comfort-reading.",
    year: 2023,
    ao3Url: "https://archiveofourown.org/works/78534791",
  },
  {
    title: "RED",
    author: "TLTLY_86",
    tags: ["Alternate universe (AU)", "Slow burn", "Smut", "Bittersweet"],
    status: "Complete",
    chapterCurrent: 15,
    chapterTotal: 15,
    ratingAvg: 5,
    votes: 702,
    summary: "A rich AU that balances longing, sensuality, and slow-burn intensity with a moodier emotional edge.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/75106846",
  },
  {
    title: "Spit.",
    author: "femme_sapphique",
    tags: ["Alternate universe (AU)", "Slow burn", "Friends to lovers", "Bittersweet"],
    status: "Ongoing",
    chapterCurrent: 8,
    chapterTotal: null,
    ratingAvg: 4.9,
    votes: 490,
    summary: "Messy feelings, tension, and a compelling premise — ideal for readers who like their romance simmering and a little painful.",
    year: 2024,
    ao3Url: "https://archiveofourown.org/works/72824441",
  },
]; */