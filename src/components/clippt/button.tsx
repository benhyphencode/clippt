"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

/**
 * v2.1 Button — three variants of one shape.
 * primary: glass body + glow (coral). Used for Save, Follow, primary CTAs.
 * secondary: soft-elevated neutral. Used for cancel, dismiss.
 * destructive: soft-elevated red. Used for Delete.
 */
export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 h-[42px] px-4 rounded-[10px] font-medium text-[14px] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  if (variant === "primary") {
    return (
      <button
        className={cn("glass-button", base, className)}
        style={{
          color: "var(--coral-text)",
          border: "1px solid rgba(242, 92, 58, 0.55)",
          boxShadow:
            "inset 0 0 16px rgba(242, 92, 58, 0.25), 0 0 0 0.5px rgba(242, 92, 58, 0.35)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "rgba(242, 92, 58, 0.7)";
          el.style.boxShadow =
            "inset 0 0 16px rgba(242, 92, 58, 0.25), 0 0 0 0.5px rgba(242, 92, 58, 0.5)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "rgba(242, 92, 58, 0.55)";
          el.style.boxShadow =
            "inset 0 0 16px rgba(242, 92, 58, 0.25), 0 0 0 0.5px rgba(242, 92, 58, 0.35)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow =
            "inset 0 0 16px rgba(242, 92, 58, 0.12), 0 0 0 0.5px rgba(242, 92, 58, 0.5)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow =
            "inset 0 0 16px rgba(242, 92, 58, 0.25), 0 0 0 0.5px rgba(242, 92, 58, 0.5)";
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "destructive") {
    return (
      <button
        className={cn(base, "text-white", className)}
        style={{
          backgroundColor: "#E5484D",
          boxShadow: "0 2px 8px rgba(229, 72, 77, 0.30)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(229, 72, 77, 0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(229, 72, 77, 0.30)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(229, 72, 77, 0.30)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(229, 72, 77, 0.45)";
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  // secondary
  return (
    <button
      className={cn(
        base,
        "bg-surface-alt text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
