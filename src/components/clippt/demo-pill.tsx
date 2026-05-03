/**
 * v2.1 Demo affordance — persistent thin pill in nav top-right.
 * Glass body, neutral border. Default text "demo".
 * On hover, expands to show the full sentence.
 * CSS-only, no JS state.
 */
export function DemoPill() {
  return (
    <div
      className="group/demo glass-pill inline-flex items-center justify-start overflow-hidden rounded-full border border-line h-[28px] transition-[width,padding] duration-300 ease-out cursor-default"
      style={{
        width: "60px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.width = "360px";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.width = "60px";
      }}
      aria-label="clippt v2 demo: real URLs, fictitious users and notes."
    >
      <span className="px-[11px] text-[11.5px] font-semibold text-ink-2 whitespace-nowrap tracking-[-0.005em]">
        <span className="group-hover/demo:hidden">demo</span>
        <span className="hidden group-hover/demo:inline">
          clippt v2 demo: real URLs, fictitious users and notes.
        </span>
      </span>
    </div>
  );
}
