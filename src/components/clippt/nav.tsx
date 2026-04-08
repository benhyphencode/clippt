"use client";

import { Logo } from "./logo";
import { Button3D } from "./button-3d";
import { ThemeToggle } from "./theme-toggle";

interface NavProps {
  onClipClick: () => void;
}

export function Nav({ onClipClick }: NavProps) {
  return (
    <nav className="h-[56px] flex items-center justify-between px-xl border-b border-border">
      <Logo />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button3D onClick={onClipClick} variant="coral">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-0.5"
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Clip
        </Button3D>
      </div>
    </nav>
  );
}
