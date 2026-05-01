import {
  TagHeroSkeleton,
  SaveCardSkeleton,
} from "@/components/clippt/skeleton";

/** Tag page loading skeleton */
export default function TagLoading() {
  return (
    <div className="max-w-[960px] mx-auto">
      <TagHeroSkeleton />
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-md">
            {Array.from({ length: 4 }).map((_, i) => (
              <SaveCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <aside className="lg:w-[260px] shrink-0 space-y-xl">
          <div>
            <div className="animate-pulse h-4 w-[80px] rounded-md bg-surface-alt mb-md" />
            <div className="flex flex-col gap-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="animate-pulse w-7 h-7 rounded-full bg-surface-alt" />
                  <div className="animate-pulse h-3.5 w-[100px] rounded-md bg-surface-alt" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="animate-pulse h-4 w-[90px] rounded-md bg-surface-alt mb-md" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-6 rounded-full bg-surface-alt"
                  style={{ width: `${60 + Math.random() * 50}px` }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
