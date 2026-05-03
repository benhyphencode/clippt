import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getSaves,
  getTagSaveCount,
  getTagSaverCount,
  getTagLastSaveDate,
  getTopSavers,
  getRelatedTags,
  isFollowingTag,
} from "@/lib/queries";
import { LoadMoreSaves } from "@/components/clippt/load-more-saves";
import { UserByline } from "@/components/clippt/user-byline";
import { TagCloud } from "@/components/clippt/tag-cloud";
import { TagFollowButton } from "@/components/clippt/tag-follow-button";
import { HeroBloomUnderGlass } from "@/components/clippt/hero-bloom-under-glass";
import { getTagCategory } from "@/lib/tag-colours";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const client = await createServerClient();

  const [saveCount, saverCount] = await Promise.all([
    getTagSaveCount(client, decodedTag),
    getTagSaverCount(client, decodedTag),
  ]);

  const description = `${saveCount} save${saveCount !== 1 ? "s" : ""} from ${saverCount} ${saverCount === 1 ? "person" : "people"}.`;

  return {
    title: `#${decodedTag}`,
    description,
    openGraph: {
      title: `#${decodedTag} — clippt`,
      description,
      url: `https://clippt.xyz/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const client = await createServerClient();
  const currentUser = await getCurrentUser();

  // Parallel data fetches
  const [saves, saveCount, saverCount, lastSaveDate, topSavers, relatedTags, following] =
    await Promise.all([
      getSaves(client, { tag: decodedTag, limit: 20 }),
      getTagSaveCount(client, decodedTag),
      getTagSaverCount(client, decodedTag),
      getTagLastSaveDate(client, decodedTag),
      getTopSavers(client, decodedTag, 5),
      getRelatedTags(client, decodedTag, 10),
      isFollowingTag(client, currentUser.id, decodedTag),
    ]);

  const lastSaveFormatted = lastSaveDate
    ? new Date(lastSaveDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const family = getTagCategory(decodedTag);

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── Tag Hero (bloom under glass) ────────── */}
      <HeroBloomUnderGlass family={family} className="mb-xl min-h-[210px]">
        <div className="flex items-end justify-between gap-4 px-7 py-7 min-h-[210px]">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-ink-3 mb-3">
              Tag
            </p>
            <h1
              className="font-black text-ink leading-[0.92] tracking-[-0.045em]"
              style={{ fontSize: "78px" }}
            >
              #{decodedTag}
            </h1>
            <div className="flex items-center gap-4 text-[13px] mt-4">
              <span className="text-ink-2">
                <span className="font-semibold text-ink">{saveCount}</span>{" "}
                clippt{saveCount !== 1 ? "s" : ""}
              </span>
              <span className="text-ink-3">·</span>
              <span className="text-ink-2">
                <span className="font-semibold text-ink">{saverCount}</span>{" "}
                saver{saverCount !== 1 ? "s" : ""}
              </span>
              {lastSaveFormatted && (
                <>
                  <span className="text-ink-3">·</span>
                  <span className="text-ink-3">
                    last save {lastSaveFormatted}
                  </span>
                </>
              )}
            </div>
          </div>

          <TagFollowButton
            currentUserId={currentUser.id}
            tag={decodedTag}
            initialIsFollowing={following}
          />
        </div>
      </HeroBloomUnderGlass>

      {/* ── Main: saves + sidebar ─────────── */}
      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Saves list */}
        <div className="flex-1 min-w-0">
          {saves.length > 0 ? (
            <LoadMoreSaves
              initialSaves={saves}
              totalCount={saveCount}
              filters={{ tag: decodedTag }}
            />
          ) : (
            <div className="border border-dashed border-border-strong rounded-xl p-xl text-center">
              <p className="text-[15px] text-text-muted">
                No saves tagged &ldquo;{decodedTag}&rdquo; yet.
              </p>
              <p className="text-[13px] text-text-faint mt-1">
                Be the first to save something with this tag.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-[260px] shrink-0 space-y-xl">
          {/* Top savers */}
          {topSavers.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold text-text-secondary mb-md">
                Top savers
              </h2>
              <div className="flex flex-col gap-sm">
                {topSavers.map(({ user, count }) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <UserByline
                      handle={user.handle}
                      displayName={user.display_name}
                      avatarUrl={user.avatar_url}
                      size="sm"
                    />
                    <span className="text-[12px] text-text-faint font-medium ml-2">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related tags */}
          {relatedTags.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold text-text-secondary mb-md">
                Related tags
              </h2>
              <TagCloud tags={relatedTags} max={10} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
