"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Resource, getResources, getTagCounts, seedIfEmpty } from "@/lib/data";
import { Nav } from "@/components/clippt/nav";
import { TagSidebar } from "@/components/clippt/tag-sidebar";
import { ColourBurst } from "@/components/clippt/colour-burst";
import { SaveCard } from "@/components/clippt/save-card";
import { EmptyState } from "@/components/clippt/empty-state";
import { SaveDialog } from "@/components/clippt/save-dialog";
import { ClipptToast } from "@/components/clippt/clippt-toast";

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newResourceId, setNewResourceId] = useState<string | null>(null);

  // Sync activeTag from URL
  const activeTag = searchParams.get("tag");

  const setActiveTag = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
      const query = params.toString();
      router.push(query ? `/?${query}` : "/", { scroll: false });
    },
    [searchParams, router]
  );

  const refresh = useCallback(() => {
    setResources(getResources());
  }, []);

  useEffect(() => {
    seedIfEmpty();
    refresh();
  }, [refresh]);

  const tagCounts = getTagCounts(resources);
  const filtered = activeTag
    ? resources.filter((r) => r.tags.includes(activeTag))
    : resources;

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  const handleSaved = (id: string) => {
    setSaveOpen(false);
    setNewResourceId(id);
    setShowToast(true);
    refresh();
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Outer container */}
      <div className="max-w-[1280px] w-full mx-auto border-x-0 md:border border-border md:rounded-2xl overflow-hidden flex flex-col flex-1 md:my-md">
        <Nav onClipClick={() => setSaveOpen(true)} />

        {/* Mobile: horizontal tag strip */}
        {tagCounts.length > 0 && (
          <nav aria-label="Filter by tag" className="md:hidden">
            <TagSidebar
              tags={tagCounts}
              activeTag={activeTag}
              onTagClick={handleTagClick}
              variant="strip"
            />
          </nav>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Desktop: vertical sidebar */}
          {tagCounts.length > 0 && (
            <nav aria-label="Filter by tag" className="hidden md:block">
              <TagSidebar
                tags={tagCounts}
                activeTag={activeTag}
                onTagClick={handleTagClick}
                variant="sidebar"
              />
            </nav>
          )}

          {/* Main content */}
          <main id="main-content" className="flex-1 flex flex-col min-w-0">
            {/* Colour burst */}
            <ColourBurst
              tag={activeTag}
              count={filtered.length}
              onClear={() => setActiveTag(null)}
            />

            {/* Header (default) */}
            {!activeTag && (
              <div className="px-md pt-md pb-sm md:px-xl md:pt-xl md:pb-md">
                <h1 className="text-[22px] md:text-[28px] font-black text-text">
                  Your clippts
                </h1>
                <p className="text-[14px] text-text-muted mt-1">
                  {resources.length} save{resources.length !== 1 ? "s" : ""} across{" "}
                  {tagCounts.length} tag{tagCounts.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Cards grid */}
            {filtered.length > 0 ? (
              <div className="px-md pb-md md:px-xl md:pb-xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {filtered.map((resource) => (
                  <SaveCard
                    key={resource.id}
                    resource={resource}
                    isNew={resource.id === newResourceId}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                filteredTag={activeTag ?? undefined}
                onCtaClick={activeTag ? undefined : () => setSaveOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Save dialog */}
      <SaveDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSaved={handleSaved}
      />

      {/* Toast */}
      <ClipptToast
        show={showToast}
        onDone={() => {
          setShowToast(false);
          setNewResourceId(null);
        }}
      />
    </div>
  );
}
