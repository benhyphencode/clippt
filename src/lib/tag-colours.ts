/**
 * v2.1 — Deterministic tag → colour mapping.
 * djb2 hash, mod 5, maps to one of the five clippt families.
 * Each family has saturated, soft, and dark-text values.
 */

export type TagCategory = "indigo" | "teal" | "coral" | "amber" | "rose";

const CATEGORIES: TagCategory[] = ["indigo", "teal", "coral", "amber", "rose"];

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getTagCategory(tag: string): TagCategory {
  return CATEGORIES[hashString(tag.toLowerCase()) % 5];
}

export interface TagColours {
  category: TagCategory;
  /** Hex of the saturated colour — used for bloom hue, rim, glow */
  saturated: string;
  /** Hex of the soft colour — used for pill text in dark mode */
  soft: string;
  /** Hex of dark-text colour — used for pill text in light mode */
  darkText: string;
  /** CSS var to text colour (mode-aware via CSS) */
  text: string;
  /** Pill body fill (mode-aware glass) */
  bg: string;
  /** rgba string for rim border at 0.55 alpha */
  rim: string;
  /** rgba string for inner glow at 0.20 alpha */
  innerGlow: string;
  /** rgba string for outer halo at 0.30 alpha */
  outerHalo: string;
}

const FAMILIES: Record<
  TagCategory,
  { saturated: string; soft: string; darkText: string }
> = {
  indigo: { saturated: "#5B5CF0", soft: "#B0B1F8", darkText: "#4546B8" },
  teal: { saturated: "#18B5A0", soft: "#6FE0CC", darkText: "#0D7A5F" },
  coral: { saturated: "#F25C3A", soft: "#FB9D85", darkText: "#B84A24" },
  amber: { saturated: "#E59225", soft: "#F0C078", darkText: "#A06E12" },
  rose: { saturated: "#E85B8A", soft: "#F498B6", darkText: "#B83568" },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getTagColours(tag: string): TagColours {
  const category = getTagCategory(tag);
  const fam = FAMILIES[category];
  return {
    category,
    saturated: fam.saturated,
    soft: fam.soft,
    darkText: fam.darkText,
    text: `var(--tag-${category}-text)`,
    bg: `var(--tag-${category}-bg)`,
    rim: hexToRgba(fam.saturated, 0.55),
    innerGlow: hexToRgba(fam.saturated, 0.2),
    outerHalo: hexToRgba(fam.saturated, 0.3),
  };
}

export function getFamilyHex(category: TagCategory): string {
  return FAMILIES[category].saturated;
}
