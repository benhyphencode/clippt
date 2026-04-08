"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { createResource } from "@/lib/data";
import { Button3D } from "./button-3d";
import { TagPill } from "./tag-pill";

interface SaveDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
}

export function SaveDialog({ open, onClose, onSaved }: SaveDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleResolved, setTitleResolved] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Reset form
      setUrl("");
      setTitle("");
      setTitleResolved(false);
      setTitleError(false);
      setTags([]);
      setTagInput("");
      setNotes("");
      setSaving(false);
      setTimeout(() => urlRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-resolve title from URL
  useEffect(() => {
    if (!url) {
      setTitleResolved(false);
      setTitleError(false);
      return;
    }
    // Only try if it looks like a URL
    try {
      new URL(url);
    } catch {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/meta?url=${encodeURIComponent(url)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.title && !title) {
            setTitle(data.title);
            setTitleResolved(true);
            setTitleError(false);
          }
        } else {
          setTitleError(true);
          setTitleResolved(false);
        }
      } catch {
        // Aborted or failed — ignore
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const addTag = (value: string) => {
    const t = value.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = () => {
    if (!url || !title) return;
    setSaving(true);
    try {
      const resource = createResource({ url, title, tags, notes });
      onSaved(resource.id);
    } catch {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-[rgba(23,23,28,0.4)] dark:bg-[rgba(0,0,0,0.6)]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
        <div
          className="bg-surface w-full max-w-[480px] rounded-2xl p-xl shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-[22px] font-black text-text">
              Save to your library
            </h2>
            <button
              onClick={onClose}
              className="text-[18px] text-text-faint hover:text-text transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-md">
            {/* URL */}
            <div>
              <label className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint block mb-1.5">
                URL
              </label>
              <input
                ref={urlRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a URL to clip..."
                className="w-full h-[40px] px-3 rounded-[10px] bg-surface-alt border border-border text-[14px] text-text placeholder:text-text-faint focus:border-coral focus:shadow-[0_0_0_3px_rgba(242,92,58,0.12)] outline-none transition-all"
              />
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint">
                  Title
                </label>
                {titleResolved && (
                  <span className="text-[10px] font-medium text-tag-teal-text">
                    ✓ Auto-resolved
                  </span>
                )}
                {titleError && (
                  <span className="text-[10px] font-medium text-[#E53E3E]">
                    ✕ Couldn&apos;t reach that URL
                  </span>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleResolved(false);
                }}
                className="w-full h-[40px] px-3 rounded-[10px] bg-surface-alt border border-border text-[14px] text-text focus:border-coral focus:shadow-[0_0_0_3px_rgba(242,92,58,0.12)] outline-none transition-all"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint block mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-[10px] bg-surface-alt border border-border focus-within:border-coral focus-within:shadow-[0_0_0_3px_rgba(242,92,58,0.12)] transition-all">
                {tags.map((tag) => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    size="sm"
                    onRemove={() => setTags(tags.filter((t) => t !== tag))}
                  />
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  className="flex-1 min-w-[80px] h-[28px] bg-transparent text-[14px] text-text outline-none placeholder:text-text-faint"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint">
                  Notes
                </label>
                <span className="text-[10px] font-normal text-text-faint">
                  Optional
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What makes this worth saving?"
                rows={3}
                className="w-full px-3 py-2.5 rounded-[10px] bg-surface-alt border border-border text-[14px] text-text leading-[22px] placeholder:text-text-faint focus:border-coral focus:shadow-[0_0_0_3px_rgba(242,92,58,0.12)] outline-none transition-all resize-none"
              />
            </div>

            {/* CTA */}
            <Button3D
              variant="coral"
              fullWidth
              onClick={handleSave}
              disabled={!url || !title || saving}
            >
              {saving ? "Saving..." : "Save to library"}
            </Button3D>
          </div>
        </div>
      </div>
    </>
  );
}
