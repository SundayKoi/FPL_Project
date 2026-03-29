export const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"] as const;
export type Role = (typeof ROLES)[number];

export const RANKS = [
  "Platinum 4",
  "Platinum 3",
  "Platinum 2",
  "Platinum 1",
  "Emerald 4",
  "Emerald 3",
  "Emerald 2",
  "Emerald 1",
  "Diamond 4",
  "Diamond 3",
  "Diamond 2",
  "Diamond 1",
] as const;
export type Rank = (typeof RANKS)[number];

export const GOOGLE_SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/187hoKxxeSpSPtDAmlrTOeuDrcz5kpdwv1qgQ5kipaHY/edit?gid=761619195#gid=761619195";

export const GOOGLE_SHEETS_EMBED_URL =
  "https://docs.google.com/spreadsheets/d/187hoKxxeSpSPtDAmlrTOeuDrcz5kpdwv1qgQ5kipaHY/pubhtml?gid=761619195&single=true&widget=true&headers=false";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sign Up", href: "/signup" },
] as const;
