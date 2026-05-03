import type { ReactNode } from "react";

export type TagFamily = "indigo" | "teal" | "coral" | "amber" | "rose";

const FAMILY_HEX: Record<TagFamily, string> = {
  indigo: "#5B5CF0",
  teal: "#18B5A0",
  coral: "#F25C3A",
  amber: "#E59225",
  rose: "#E85B8A",
};

interface HeroBloomUnderGlassProps {
  /** Tag family driving the bloom hue */
  family: TagFamily;
  /** Slim variant: ~80px tall for filter band on /[user]/[tag] */
  variant?: "hero" | "band";
  className?: string;
  children: ReactNode;
}

/**
 * v2.1 signature component — bloom-under-glass hero.
 * Three layers: radial-gradient bloom → translucent glass with backdrop-blur → content.
 * Bloom recipe is colour-agnostic; only --bloom-color changes per family.
 */
export function HeroBloomUnderGlass({
  family,
  variant = "hero",
  className = "",
  children,
}: HeroBloomUnderGlassProps) {
  const hex = FAMILY_HEX[family];
  const cls = variant === "band" ? "bloom-band" : "bloom-hero";

  return (
    <div
      className={`${cls} rounded-[20px] border border-line ${className}`}
      style={{ ["--bloom-color" as string]: hex }}
    >
      {children}
    </div>
  );
}
