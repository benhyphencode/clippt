"use client";

import { getTagColours } from "@/lib/tag-colours";

interface ColourBurstProps {
  tag: string | null;
  count: number;
  onClear: () => void;
}

export function ColourBurst({ tag, count, onClear }: ColourBurstProps) {
  const colours = tag ? getTagColours(tag) : null;

  return (
    <div
      className="overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        maxHeight: tag ? "120px" : "0px",
        opacity: tag ? 1 : 0,
      }}
    >
      {tag && colours && (
        <div
          className="px-xl py-lg flex items-center justify-between"
          style={{ backgroundColor: colours.strong }}
        >
          <div>
            <h2
              className="text-[36px] font-black tracking-[-0.015em] leading-tight"
              style={{ color: colours.burstHeading }}
            >
              {tag}
            </h2>
            <p
              className="text-[14px] font-normal mt-0.5"
              style={{ color: colours.burstMuted }}
            >
              {count} clippt{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-[13px] font-semibold px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: colours.burstHeading }}
          >
            Clear ✕
          </button>
        </div>
      )}
    </div>
  );
}
