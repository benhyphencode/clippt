import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getUrlByShortId } from "@/lib/url-id";
import {
  getChorusForUrl,
  getUrlTagTaxonomy,
  getUrlSaveCount,
  getRelatedSaves,
} from "@/lib/queries";
import { EditableSaveCard } from "@/components/clippt/editable-save-card";
import { TagCloud } from "@/components/clippt/tag-cloud";

interface UrlDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UrlDetailPageProps): Promise<Metadata> {
  const { id: shortId } = await params;
  const client = await createServerClient();
  const urlRecord = await getUrlByShortId(client, shortId);
  if (!urlRecord) return { title: "Not found" };

  const saveCount = await getUrlSaveCount(client, urlRecord.id);
  const title = urlRecord.title || urlRecord.url;
  const description = `${saveCount} ${saveCount === 1 ? "person" : "people"} saved this with their own notes.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — clippt`,
      description,
      url: `https://clippt.xyz/url/${shortId}`,
    },
  };
}

export default async function UrlDetailPage({ params }: UrlDetailPageProps) {
  const { id: shortId } = await params;
  const client = await createServerClient();
  const currentUser = await getCurrentUser();

  // Look up the URL by short ID
  const urlRecord = await getUrlByShortId(client, shortId);
  if (!urlRecord) notFound();

  // Parallel data fetches
  const [chorus, tagTaxonomy, saveCount, relatedSaves] = await Promise.all([
    getChorusForUrl(client, urlRecord.id),
    getUrlTagTaxonomy(client, urlRecord.id),
    getUrlSaveCount(client, urlRecord.id),
    getRelatedSaves(client, urlRecord.id, 6),
  ]);

  const domain = extractDomain(urlRecord.url);

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── URL Hero ──────────────────────────── */}
      <section className="mb-xl pb-xl border-b border-border">
        <p className="text-[13px] text-text-faint mb-1">{domain}</p>

        <h1 className="text-[24px] sm:text-[28px] font-black text-text mb-3 leading-tight">
          {urlRecord.title || urlRecord.url}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <a
            href={urlRecord.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral hover:text-coral-dark transition-colors"
          >
            Visit original
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
              <path d="M4.5 2.5h5v5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <span className="text-[13px] text-text-secondary">
            <span className="font-semibold text-text">{saveCount}</span>{" "}
            save{saveCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tag taxonomy */}
        {tagTaxonomy.length > 0 && (
          <TagCloud tags={tagTaxonomy} max={12} />
        )}
      </section>

      {/* ── Main: chorus + related ─────────── */}
      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Chorus */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-text mb-1">
            Chorus
          </h2>
          <p className="text-[13px] text-text-muted mb-md">
            {saveCount} {saveCount === 1 ? "person" : "people"} saved
            this with their own notes
          </p>

          <div className="flex flex-col gap-md">
            {chorus.map((save) => (
              <EditableSaveCard
                key={save.id}
                save={save}
                currentUserId={currentUser.id}
                hideUrl
              />
            ))}
          </div>
        </div>

        {/* Related saves sidebar */}
        {relatedSaves.length > 0 && (
          <aside className="lg:w-[320px] shrink-0">
            <h2 className="text-[15px] font-semibold text-text-secondary mb-md">
              Related
            </h2>
            <div className="flex flex-col gap-sm">
              {relatedSaves.map((save) => (
                <Link
                  key={save.id}
                  href={`/url/${save.url.short_id}`}
                  className="block p-md bg-surface border border-border rounded-lg hover:border-border-strong transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                >
                  <p className="text-[11px] text-text-faint mb-0.5 truncate">
                    {extractDomain(save.url.url)}
                  </p>
                  <p className="text-[14px] font-semibold text-text line-clamp-2 leading-snug">
                    {save.url.title || save.url.url}
                  </p>
                  <p className="text-[12px] text-text-muted mt-1 line-clamp-1">
                    {save.notes}
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
