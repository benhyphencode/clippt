"use client";

interface LogoMarkProps {
  scale?: number;
  className?: string;
}

/**
 * Stacked bars logo mark — 4 offset rounded rects.
 */
export function LogoMark({ scale = 0.7, className }: LogoMarkProps) {
  const w = 28 * scale;
  const h = 40 * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 28 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="28" height="7" rx="3.5" fill="#F25C3A" />
      <rect x="6" y="11" width="22" height="7" rx="3.5" fill="#5B5CF0" />
      <rect x="0" y="22" width="28" height="7" rx="3.5" fill="#18B5A0" />
      <rect x="6" y="33" width="22" height="7" rx="3.5" fill="#F0A030" />
    </svg>
  );
}

/**
 * Full logo: mark + wordmark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark />
      <span className="text-[20px] font-black tracking-[-0.02em] text-text">
        clippt
      </span>
    </div>
  );
}
