import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getUser, getSaves, getUserSaveCount } from "@/lib/queries";
import { SaveCardV2 } from "@/components/clippt/save-card-v2";
import { UserByline } from "@/components/clippt/user-byline";
import { TagPill } from "@/components/clippt/tag-pill";
import { HeroBloomUnderGlass } from "@/components/clippt/hero-bloom-under-glass";
import { getTagCategory } from "@/lib/tag-colours";

interface FilteredProfilePageProps {
  params: Promise<{ user: string; tag: string }>;
}

export async function generateMetadata({ params }: FilteredProfilePageProps): Promise<Metadata> {
  const { user: handle, tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const client = await createServerClient();
  const profileUser = await getUser(client, handle);
  if (!profileUser) return { title: "Not found" };

  const saves = await getSaves(client, { userId: profileUser.id, tag });
  const description = `${saves.length} save${saves.length !== 1 ? "s" : ""} tagged "${tag}" by ${profileUser.display_name}.`;

  return {
    title: `${profileUser.display_name} × #${tag}`,
    description,
    openGraph: {
      title: `${profileUser.display_name} × #${tag} — clippt`,
      description,
      url: `https://clippt.xyz/${handle}/${rawTag}`,
    },
  };
}

/**
 * v2.1 Filtered profile view: /[user]/[tag]
 * Profile shell preserved; library column gets a bloom-under-glass filter band.
 */
export default async function FilteredProfilePage({
  params,
}: FilteredProfilePageProps) {
  const { user: handle, tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const client = await createServerClient();

  const profileUser = await getUser(client, handle);
  if (!profileUser) notFound();

  const [saves, totalSaves] = await Promise.all([
    getSaves(client, { userId: profileUser.id, tag }),
    getUserSaveCount(client, profileUser.id),
  ]);

  const family = getTagCategory(tag);

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── Breadcrumb ─────────────────────── */}
      <Link
        href={`/${handle}`}
        className="inline-flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to {profileUser.display_name}
      </Link>

      {/* ── User header ────────────────────── */}
      <div className="flex items-center gap-3 mb-md">
        <UserByline
          handle={profileUser.handle}
          displayName={profileUser.display_name}
          avatarUrl={profileUser.avatar_url}
          size="md"
          noLink
        />
      </div>

      {/* ── Filter band (slim bloom-under-glass) ─── */}
      <HeroBloomUnderGlass family={family} variant="band" className="mb-lg min-h-[80px]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 min-h-[80px]">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-3 shrink-0">
              Filtered by
            </p>
            <TagPill tag={tag} size="md" active />
            <span className="text-[13px] text-ink-2 whitespace-nowrap">
              <span className="font-semibold text-ink">{saves.length}</span> of{" "}
              {totalSaves} save{totalSaves !== 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href={`/${handle}`}
            className="text-[13px] font-medium text-ink-2 hover:text-ink transition-colors flex items-center gap-1 shrink-0"
          >
            Clear ✕
          </Link>
        </div>
      </HeroBloomUnderGlass>

      {/* ── Saves ─────────────────────────── */}
      {saves.length > 0 ? (
        <div className="flex flex-col gap-md">
          {saves.map((save) => (
            <SaveCardV2 key={save.id} save={save} hideUser />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-strong rounded-xl p-xl text-center">
          <p className="text-[15px] text-ink-2">
            {profileUser.display_name} hasn&apos;t tagged anything &ldquo;{tag}&rdquo; yet.
          </p>
        </div>
      )}
    </div>
  );
}
