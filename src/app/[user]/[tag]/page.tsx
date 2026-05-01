import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getUser, getSaves } from "@/lib/queries";
import { SaveCardV2 } from "@/components/clippt/save-card-v2";
import { UserByline } from "@/components/clippt/user-byline";
import { TagPill } from "@/components/clippt/tag-pill";

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
 * Filtered profile view: /[user]/[tag]
 * Shows only saves from this user with this tag.
 */
export default async function FilteredProfilePage({
  params,
}: FilteredProfilePageProps) {
  const { user: handle, tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const client = await createServerClient();

  const profileUser = await getUser(client, handle);
  if (!profileUser) notFound();

  const saves = await getSaves(client, { userId: profileUser.id, tag });

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── Breadcrumb + filter ───────────── */}
      <section className="mb-xl pb-lg border-b border-border">
        <Link
          href={`/${handle}`}
          className="inline-flex items-center gap-1 text-[13px] text-text-muted hover:text-text transition-colors mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {profileUser.display_name}
        </Link>

        <div className="flex items-center gap-3">
          <UserByline
            handle={profileUser.handle}
            displayName={profileUser.display_name}
            avatarUrl={profileUser.avatar_url}
            size="md"
            noLink
          />
          <span className="text-text-faint">/</span>
          <TagPill tag={tag} size="md" />
        </div>

        <p className="text-[13px] text-text-muted mt-2">
          {saves.length} save{saves.length !== 1 ? "s" : ""} tagged &ldquo;{tag}&rdquo;
        </p>
      </section>

      {/* ── Saves ─────────────────────────── */}
      {saves.length > 0 ? (
        <div className="flex flex-col gap-md">
          {saves.map((save) => (
            <SaveCardV2 key={save.id} save={save} hideUser />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-strong rounded-xl p-xl text-center">
          <p className="text-[15px] text-text-muted">
            {profileUser.display_name} hasn&apos;t tagged anything &ldquo;{tag}&rdquo; yet.
          </p>
        </div>
      )}
    </div>
  );
}
