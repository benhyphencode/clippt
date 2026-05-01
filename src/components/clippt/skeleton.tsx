/**
 * Reusable skeleton primitives for loading states.
 * Uses CSS variables so they adapt to light/dark mode automatically.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-alt ${className}`}
    />
  );
}

/** Simulates a SaveCard loading state */
export function SaveCardSkeleton() {
  return (
    <div className="p-md bg-surface border border-border rounded-xl">
      {/* User byline */}
      <div className="flex items-center gap-2.5 mb-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      {/* Domain */}
      <Skeleton className="h-3 w-[100px] mb-2" />
      {/* Title */}
      <Skeleton className="h-5 w-full mb-1.5" />
      <Skeleton className="h-5 w-[75%] mb-3" />
      {/* Notes */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-[90%] mb-3" />
      {/* Tags + timestamp */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-[80px] rounded-full" />
        <Skeleton className="h-6 w-[60px] rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-3 w-[50px]" />
      </div>
    </div>
  );
}

/** Simulates the profile hero section */
export function ProfileHeroSkeleton() {
  return (
    <section className="mb-xl pb-xl border-b border-border">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div>
          <Skeleton className="h-5 w-[160px] mb-1.5" />
          <Skeleton className="h-3.5 w-[220px]" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[70px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
    </section>
  );
}

/** Simulates the URL detail hero section */
export function UrlHeroSkeleton() {
  return (
    <section className="mb-xl pb-xl border-b border-border">
      <Skeleton className="h-3 w-[120px] mb-2" />
      <Skeleton className="h-7 w-full mb-1.5" />
      <Skeleton className="h-7 w-[60%] mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-[90px] rounded-full" />
        ))}
      </div>
    </section>
  );
}

/** Simulates the tag page hero section */
export function TagHeroSkeleton() {
  return (
    <section className="mb-xl pb-xl border-b border-border">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-[160px] rounded-full mb-3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        </div>
        <Skeleton className="h-9 w-[100px] rounded-lg" />
      </div>
    </section>
  );
}
