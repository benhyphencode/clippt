import {
  ProfileHeroSkeleton,
  SaveCardSkeleton,
} from "@/components/clippt/skeleton";

/** Profile page loading skeleton */
export default function ProfileLoading() {
  return (
    <div className="max-w-[960px] mx-auto">
      <ProfileHeroSkeleton />
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 min-w-0">
          <div className="animate-pulse h-5 w-[60px] rounded-md bg-surface-alt mb-md" />
          <div className="flex flex-col gap-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <SaveCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <aside className="lg:w-[280px] shrink-0">
          <div className="animate-pulse h-4 w-[40px] rounded-md bg-surface-alt mb-md" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-6 rounded-full bg-surface-alt"
                style={{ width: `${60 + Math.random() * 60}px` }}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
