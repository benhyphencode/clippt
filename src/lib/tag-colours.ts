/**
 * Deterministic tag → colour mapping.
 * Hash the tag string, mod 5, map to one of the five clippt categories.
 */

export type TagCategory = "indigo" | "teal" | "coral" | "amber" | "rose";

const CATEGORIES: TagCategory[] = ["indigo", "teal", "coral", "amber", "rose"];

/**
 * Simple string hash (djb2).
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Returns the tag category for a given tag string.
 */
export function getTagCategory(tag: string): TagCategory {
  return CATEGORIES[hashString(tag.toLowerCase()) % 5];
}

/**
 * CSS variable-backed colour tokens for a tag category.
 */
export interface TagColours {
  category: TagCategory;
  bg: string;       // tint background
  text: string;     // text colour
  strong: string;   // burst header background
  borderColor: string; // 50% opacity of text colour for pill borders
  burstHeading: string;
  burstMuted: string;
}

const TAG_COLOUR_MAP: Record<TagCategory, TagColours> = {
  indigo: {
    category: "indigo",
    bg: "var(--tag-indigo-bg)",
    text: "var(--tag-indigo-text)",
    strong: "var(--tag-indigo-strong)",
    borderColor: "color-mix(in srgb, var(--tag-indigo-text) 50%, transparent)",
    burstHeading: "var(--burst-indigo-heading)",
    burstMuted: "var(--burst-indigo-muted)",
  },
  teal: {
    category: "teal",
    bg: "var(--tag-teal-bg)",
    text: "var(--tag-teal-text)",
    strong: "var(--tag-teal-strong)",
    borderColor: "color-mix(in srgb, var(--tag-teal-text) 50%, transparent)",
    burstHeading: "var(--burst-teal-heading)",
    burstMuted: "var(--burst-teal-muted)",
  },
  coral: {
    category: "coral",
    bg: "var(--tag-coral-bg)",
    text: "var(--tag-coral-text)",
    strong: "var(--tag-coral-strong)",
    borderColor: "color-mix(in srgb, var(--tag-coral-text) 50%, transparent)",
    burstHeading: "var(--burst-coral-heading)",
    burstMuted: "var(--burst-coral-muted)",
  },
  amber: {
    category: "amber",
    bg: "var(--tag-amber-bg)",
    text: "var(--tag-amber-text)",
    strong: "var(--tag-amber-strong)",
    borderColor: "color-mix(in srgb, var(--tag-amber-text) 50%, transparent)",
    burstHeading: "var(--burst-amber-heading)",
    burstMuted: "var(--burst-amber-muted)",
  },
  rose: {
    category: "rose",
    bg: "var(--tag-rose-bg)",
    text: "var(--tag-rose-text)",
    strong: "var(--tag-rose-strong)",
    borderColor: "color-mix(in srgb, var(--tag-rose-text) 50%, transparent)",
    burstHeading: "var(--burst-rose-heading)",
    burstMuted: "var(--burst-rose-muted)",
  },
};

/**
 * Get the full colour set for a tag string.
 */
export function getTagColours(tag: string): TagColours {
  return TAG_COLOUR_MAP[getTagCategory(tag)];
}
