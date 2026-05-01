"use client";

import { useState, useTransition } from "react";
import { SaveCardV2 } from "./save-card-v2";
import { EditableSaveCard } from "./editable-save-card";
import type { SaveWithDetails } from "@/lib/supabase/types";
import type { SaveFilters } from "@/lib/queries";

interface LoadMoreSavesProps {
  /** Initial saves rendered server-side */
  initialSaves: SaveWithDetails[];
  /** Total count for "Showing X of Y" */
  totalCount: number;
  /** Filters to pass when fetching more */
  filters: SaveFilters;
  /** Page size for each load */
  pageSize?: number;
  /** Current user ID (for EditableSaveCard) */
  currentUserId?: string;
  /** Whether to use EditableSaveCard instead of SaveCardV2 */
  editable?: boolean;
  /** Hide user byline on cards */
  hideUser?: boolean;
  /** Hide URL on cards */
  hideUrl?: boolean;
}

/**
 * Client component that renders a save list with "Load more" pagination.
 * Takes initial saves from the server and fetches additional pages client-side.
 */
export function LoadMoreSaves({
  initialSaves,
  totalCount,
  filters,
  pageSize = 20,
  currentUserId,
  editable = false,
  hideUser = false,
  hideUrl = false,
}: LoadMoreSavesProps) {
  const [saves, setSaves] = useState<SaveWithDetails[]>(initialSaves);
  const [isPending, startTransition] = useTransition();
  const hasMore = saves.length < totalCount;

  const loadMore = () => {
    startTransition(async () => {
      const params = new URLSearchParams();
      if (filters.userId) params.set("userId", filters.userId);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.urlId) params.set("urlId", filters.urlId);
      params.set("offset", String(saves.length));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/saves?${params.toString()}`);
      if (res.ok) {
        const newSaves: SaveWithDetails[] = await res.json();
        setSaves((prev) => [...prev, ...newSaves]);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-md">
        {saves.map((save) =>
          editable && currentUserId ? (
            <EditableSaveCard
              key={save.id}
              save={save}
              currentUserId={currentUserId}
              hideUser={hideUser}
              hideUrl={hideUrl}
            />
          ) : (
            <SaveCardV2
              key={save.id}
              save={save}
              hideUser={hideUser}
              hideUrl={hideUrl}
            />
          )
        )}
      </div>

      {/* Footer: count + load more */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-md pt-md border-t border-border">
          <p className="text-[12px] text-text-faint">
            Showing {saves.length} of {totalCount}
          </p>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isPending}
              className="text-[13px] font-semibold text-coral hover:text-coral-dark transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded"
            >
              {isPending ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
