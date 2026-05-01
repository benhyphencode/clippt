import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[480px] mx-auto text-center py-[120px]">
      <p className="text-[64px] font-black text-text leading-none mb-4">404</p>
      <h1 className="text-[20px] font-bold text-text mb-2">
        Page not found
      </h1>
      <p className="text-[15px] text-text-muted mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-coral text-white font-semibold text-[14px] hover:bg-coral-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to feed
      </Link>
    </div>
  );
}
