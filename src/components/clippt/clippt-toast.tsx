"use client";

import { useEffect, useState } from "react";

interface ClipptToastProps {
  show: boolean;
  onDone: () => void;
}

/**
 * Dark pill toast: green dot + "Clippt! Nice find."
 */
export function ClipptToast({ show, onDone }: ClipptToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 300); // wait for fade-out
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!show && !visible) return null;

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2 px-4 py-2.5
        bg-[#17171C] dark:bg-[#F0F0F2] text-white dark:text-[#17171C] text-[14px] font-medium
        rounded-full shadow-lg
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <span className="w-2 h-2 rounded-full bg-[#18B5A0] dark:bg-[#0D7A5F]" />
      Clippt! Nice find.
    </div>
  );
}
