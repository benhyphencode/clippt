import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getRecentFromNetwork,
  getPopularThisWeek,
  getTagFollows,
  getSaves,
} from "@/lib/queries";
import { SaveCardV2 } from "@/components/clippt/save-card-v2";
import { UserByline } from "@/components/clippt/user-byline";
import { TagPill } from "@/components/clippt/tag-pill";
import type { SaveWithDetails } from "@/lib/supabase/types";

/**
 * v2 Home — three-section feed.
 * 1. From your network (recent saves by people you follow)
 * 2. Popular this week (URLs with the most saves in 7 days)
 * 3. Tags you follow (recent saves in tags you follow)
 */
export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const client = await createServerClient();

  // Parallel data fetches
  const [networkSaves, popular, tagFollows] = await Promise.all([
    getRecentFromNetwork(client, currentUser.id, 9),
    getPopularThisWeek(client, 6),
    getTagFollows(client, currentUser.id),
  ]);

  // Fetch saves for followed tags (deduplicated)
  const followedTags = tagFollows.map((tf) => tf.tag);
  let tagSaves: SaveWithDetails[] = [];
  if (followedTags.length > 0) {
    const allTagSaves: SaveWithDetails[] = [];
    const seenIds = new Set<string>();
    for (const tag of followedTags.slice(0, 4)) {
      const saves = await getSaves(client, { tag, limit: 6 });
      for (const save of saves) {
        if (!seenIds.has(save.id)) {
          seenIds.add(save.id);
          allTagSaves.push(save);
        }
      }
    }
    tagSaves = allTagSaves.slice(0, 9);
  }

  return (
    <div className="space-y-2xl">
      {/* ── From your network ─────────────── */}
      <section>
        <div className="mb-md">
          <h1 className="text-[22px] sm:text-[26px] font-black text-text">
            From your network
          </h1>
          <p className="text-[14px] text-text-muted mt-0.5">
            Recent saves from people you follow
          </p>
        </div>

        {networkSaves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
            {networkSaves.map((save) => (
              <SaveCardV2 key={save.id} save={save} />
            ))}
          </div>
        ) : (
          <EmptySection
            text="No saves from your network yet."
            subtext="Follow some users to see their saves here."
          />
        )}
      </section>

      {/* ── Popular this week ─────────────── */}
      <section>
        <div className="mb-md">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-text">
            Popular this week
          </h2>
          <p className="text-[14px] text-text-muted mt-0.5">
            URLs saved by the most people in the last 7 days
          </p>
        </div>

        {popular.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
            {popular.map(({ url, saveCount, savers }) => (
              <Link
                key={url.id}
                href={`/url/${url.short_id}`}
                className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-xl"
              >
                <article className="bg-surface border border-border rounded-xl overflow-hidden transition-all duration-150 ease-out hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[4px_4px_0_rgba(255,255,255,0.05)]">
                  {url.og_image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={url.og_image_url}
                      alt=""
                      className="w-full h-[120px] object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-lg">
                  <p className="text-[12px] text-text-faint mb-0.5 truncate">
                    {extractDomain(url.url)}
                  </p>
                  <h3 className="text-[17px] font-bold text-text leading-snug line-clamp-2 mb-2 group-hover:text-coral transition-colors">
                    {url.title || url.url}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5">
                      {savers.slice(0, 4).map((saver) => (
                        <span
                          key={saver.id}
                          className="w-6 h-6 rounded-full bg-surface-alt border-2 border-surface flex items-center justify-center text-[9px] font-semibold text-text-muted"
                          title={saver.display_name}
                        >
                          {saver.display_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </span>
                      ))}
                    </div>
                    <span className="text-[12px] text-text-muted font-medium">
                      {saveCount} save{saveCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <EmptySection
            text="No popular saves this week."
            subtext="Check back later as more people save links."
          />
        )}
      </section>

      {/* ── Tags you follow ───────────────── */}
      {followedTags.length > 0 && (
        <section>
          <div className="mb-md">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-text">
              Tags you follow
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {followedTags.map((tag) => (
                <Link key={tag} href={`/tag/${tag}`}>
                  <TagPill tag={tag} size="sm" />
                </Link>
              ))}
            </div>
          </div>

          {tagSaves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
              {tagSaves.map((save) => (
                <SaveCardV2 key={save.id} save={save} />
              ))}
            </div>
          ) : (
            <EmptySection
              text="No recent saves in your followed tags."
              subtext="Save some links with these tags to see them here."
            />
          )}
        </section>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────

function EmptySection({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="border border-dashed border-border-strong rounded-xl p-xl text-center">
      <p className="text-[15px] font-medium text-text-muted">{text}</p>
      <p className="text-[13px] text-text-faint mt-1">{subtext}</p>
    </div>
  );
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
