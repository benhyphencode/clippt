"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="max-w-[480px] mx-auto text-center py-[120px]">
      <p className="text-[48px] leading-none mb-4">⚠️</p>
      <h1 className="text-[20px] font-bold text-text mb-2">
        Something went wrong
      </h1>
      <p className="text-[15px] text-text-muted mb-8">
        An unexpected error occurred. Try refreshing or come back later.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-coral text-white font-semibold text-[14px] hover:bg-coral-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
      >
        Try again
      </button>
    </div>
  );
}
