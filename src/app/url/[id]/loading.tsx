import {
  UrlHeroSkeleton,
  SaveCardSkeleton,
} from "@/components/clippt/skeleton";

/** URL detail page loading skeleton */
export default function UrlLoading() {
  return (
    <div className="max-w-[960px] mx-auto">
      <UrlHeroSkeleton />
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 min-w-0">
          <div className="animate-pulse h-5 w-[80px] rounded-md bg-surface-alt mb-1" />
          <div className="animate-pulse h-4 w-[240px] rounded-md bg-surface-alt mb-md" />
          <div className="flex flex-col gap-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <SaveCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <aside className="lg:w-[320px] shrink-0">
          <div className="animate-pulse h-4 w-[60px] rounded-md bg-surface-alt mb-md" />
          <div className="flex flex-col gap-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-md bg-surface border border-border rounded-lg"
              >
                <div className="animate-pulse h-3 w-[80px] rounded-md bg-surface-alt mb-1" />
                <div className="animate-pulse h-4 w-full rounded-md bg-surface-alt mb-1" />
                <div className="animate-pulse h-3 w-[60%] rounded-md bg-surface-alt" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
