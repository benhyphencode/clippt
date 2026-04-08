"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "coral" | "dark";
  fullWidth?: boolean;
}

const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant = "coral", fullWidth = false, children, ...props }, ref) => {
    const outerBg = variant === "coral" ? "bg-coral-dark" : "bg-[#0A0A0F]";
    const innerGradient =
      variant === "coral"
        ? "bg-gradient-to-b from-coral from-40% to-coral-dark"
        : "bg-gradient-to-b from-[#17171C] from-40% to-[#0A0A0F]";

    return (
      <button
        ref={ref}
        className={cn(
          "group/btn-3d rounded-lg pb-[3px] transition-transform duration-100",
          outerBg,
          fullWidth && "w-full",
          "hover:-translate-y-[1px]",
          "active:pb-0 active:translate-y-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-4 py-2",
            "text-sm font-semibold text-white",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
            "transition-all duration-100",
            innerGradient,
            fullWidth && "w-full",
            "group-active/btn-3d:translate-y-[3px] group-active/btn-3d:shadow-none",
            "group-active/btn-3d:bg-gradient-to-b group-active/btn-3d:from-coral-dark group-active/btn-3d:to-coral"
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);

Button3D.displayName = "Button3D";
export { Button3D };
