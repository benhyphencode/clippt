import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUser,
  getSaves,
  getTagCounts,
  getFollowCounts,
  getUserSaveCount,
  getTagFollows,
  isFollowing,
} from "@/lib/queries";
import Link from "next/link";
import { TagPill } from "@/components/clippt/tag-pill";
import { LoadMoreSaves } from "@/components/clippt/load-more-saves";
import { TagCloud } from "@/components/clippt/tag-cloud";
import { UserByline } from "@/components/clippt/user-byline";
import { FollowButton } from "@/components/clippt/follow-button";

interface ProfilePageProps {
  params: Promise<{ user: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { user: handle } = await params;
  const client = await createServerClient();
  const profileUser = await getUser(client, handle);
  if (!profileUser) return { title: "Not found" };

  const saveCount = await getUserSaveCount(client, profileUser.id);
  const description = [
    profileUser.identity_line,
    `${saveCount} save${saveCount !== 1 ? "s" : ""} on clippt.`,
  ].filter(Boolean).join(" · ");

  return {
    title: profileUser.display_name,
    description,
    openGraph: {
      title: `${profileUser.display_name} — clippt`,
      description,
      url: `https://clippt.xyz/${handle}`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user: handle } = await params;
  const client = await createServerClient();
  const currentUser = await getCurrentUser();

  // Fetch the profile user
  const profileUser = await getUser(client, handle);
  if (!profileUser) notFound();

  const isOwnProfile = currentUser.id === profileUser.id;

  // Parallel data fetches
  const [saves, tagCounts, followCounts, saveCount, followingState, tagFollows] =
    await Promise.all([
      getSaves(client, { userId: profileUser.id, limit: 20 }),
      getTagCounts(client, profileUser.id),
      getFollowCounts(client, profileUser.id),
      getUserSaveCount(client, profileUser.id),
      isOwnProfile
        ? Promise.resolve(false)
        : isFollowing(client, currentUser.id, profileUser.id),
      getTagFollows(client, profileUser.id),
    ]);

  const joinDate = new Date(profileUser.joined_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── Profile Hero ──────────────────────── */}
      <section className="mb-xl pb-xl border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <UserByline
              handle={profileUser.handle}
              displayName={profileUser.display_name}
              avatarUrl={profileUser.avatar_url}
              identityLine={profileUser.identity_line}
              size="lg"
              noLink
            />
          </div>

          {!isOwnProfile && (
            <FollowButton
              currentUserId={currentUser.id}
              targetUserId={profileUser.id}
              initialIsFollowing={followingState}
            />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 text-[13px]">
          <span className="text-text-secondary">
            <span className="font-semibold text-text">{saveCount}</span>{" "}
            save{saveCount !== 1 ? "s" : ""}
          </span>
          <span className="text-text-secondary">
            <span className="font-semibold text-text">
              {followCounts.followers}
            </span>{" "}
            follower{followCounts.followers !== 1 ? "s" : ""}
          </span>
          <span className="text-text-secondary">
            <span className="font-semibold text-text">
              {followCounts.following}
            </span>{" "}
            following
          </span>
          <span className="text-text-faint">Joined {joinDate}</span>
        </div>

        {/* Tags you follow — third element in identity column, hidden when empty */}
        {tagFollows.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-3 mb-2">
              Following
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tagFollows.map((tf) => (
                <Link key={tf.tag} href={`/tag/${tf.tag}`}>
                  <TagPill tag={tf.tag} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Main content: saves + sidebar ───── */}
      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Saves list */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-text mb-md">
            Saves
          </h2>

          {saves.length > 0 ? (
            <LoadMoreSaves
              initialSaves={saves}
              totalCount={saveCount}
              filters={{ userId: profileUser.id }}
              currentUserId={currentUser.id}
              editable={isOwnProfile}
              hideUser
            />
          ) : (
            <div className="border border-dashed border-border-strong rounded-xl p-xl text-center">
              <p className="text-[15px] text-text-muted">
                {isOwnProfile
                  ? "You haven't saved anything yet."
                  : `${profileUser.display_name} hasn't saved anything yet.`}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: tag cloud */}
        {tagCounts.length > 0 && (
          <aside className="lg:w-[280px] shrink-0">
            <h2 className="text-[15px] font-semibold text-text-secondary mb-md">
              Tags
            </h2>
            <TagCloud
              tags={tagCounts}
              max={20}
              userHandle={profileUser.handle}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
