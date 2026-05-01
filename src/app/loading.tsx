import { SaveCardSkeleton } from "@/components/clippt/skeleton";

/** Root loading state — shown during navigation to home feed */
export default function Loading() {
  return (
    <div className="max-w-[960px] mx-auto">
      <div className="mb-xl">
        <div className="animate-pulse h-7 w-[220px] rounded-md bg-surface-alt mb-2" />
        <div className="animate-pulse h-4 w-[280px] rounded-md bg-surface-alt" />
      </div>
      <div className="flex flex-col gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <SaveCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
