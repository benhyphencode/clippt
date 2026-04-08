"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Resource, getResource, deleteResource } from "@/lib/data";
import { Nav } from "@/components/clippt/nav";
import { TagPill } from "@/components/clippt/tag-pill";
import { Button3D } from "@/components/clippt/button-3d";
import { SaveDialog } from "@/components/clippt/save-dialog";
import Link from "next/link";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const r = getResource(id);
    if (r) {
      setResource(r);
    } else {
      router.push("/");
    }
  }, [params.id, router]);

  const handleDelete = () => {
    if (!resource) return;
    if (window.confirm("Delete this clippt?")) {
      deleteResource(resource.id);
      router.push("/");
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  };

  if (!resource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="max-w-[1280px] w-full mx-auto border border-border rounded-2xl overflow-hidden flex flex-col flex-1 my-md">
        <Nav onClipClick={() => setSaveOpen(true)} />

        <main className="flex-1 pl-[80px] pr-xl py-xl max-w-[680px]">
          {/* Back link */}
          <Link
            href="/"
            className="text-[13px] font-semibold text-text-muted hover:text-text transition-colors inline-block mb-lg"
          >
            ← Back to library
          </Link>

          {/* Domain */}
          <p className="text-[13px] font-normal text-text-faint mb-2">
            {resource.domain}
          </p>

          {/* Title */}
          <h1 className="text-[32px] font-black text-text leading-[40px] mb-md">
            {resource.title}
          </h1>

          {/* Notes */}
          {resource.notes && (
            <p className="text-[16px] leading-[26px] text-text-secondary/70 mb-lg">
              {resource.notes}
            </p>
          )}

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-lg">
              {resource.tags.map((tag) => (
                <TagPill key={tag} tag={tag} size="lg" />
              ))}
            </div>
          )}

          {/* Divider */}
          <hr className="border-border mb-md" />

          {/* Meta */}
          <p className="text-[13px] text-text-faint mb-lg">
            Saved on {formatDate(resource.createdAt)} · Last edited{" "}
            {timeAgo(resource.updatedAt)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button3D variant="dark">
                Visit original ↗
              </Button3D>
            </a>
            <button
              onClick={() => setEditOpen(true)}
              className="h-[40px] px-4 rounded-lg border border-border text-[14px] font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="h-[40px] px-4 rounded-lg border text-[14px] font-medium transition-colors border-[rgba(229,62,62,0.3)] text-[#E53E3E] hover:bg-[rgba(229,62,62,0.05)]"
            >
              Delete
            </button>
          </div>
        </main>
      </div>

      {/* Save dialog (for nav clip button) */}
      <SaveDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSaved={() => {
          setSaveOpen(false);
          router.push("/");
        }}
      />

      {/* Edit dialog */}
      <SaveDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editResource={resource}
        onSaved={(id) => {
          setEditOpen(false);
          // Refresh resource data
          const updated = getResource(id);
          if (updated) setResource(updated);
        }}
      />
    </div>
  );
}
