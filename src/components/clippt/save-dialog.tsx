"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { createResource, updateResource, type Resource } from "@/lib/data";
import { Button3D } from "./button-3d";
import { TagPill } from "./tag-pill";

interface SaveDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
  /** Pass an existing resource to enter edit mode */
  editResource?: Resource | null;
}

export function SaveDialog({ open, onClose, onSaved, editResource }: SaveDialogProps) {
  const isEdit = !!editResource;
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleResolved, setTitleResolved] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [titleResolving, setTitleResolving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Track the element that opened the modal for focus restoration
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      if (editResource) {
        setUrl(editResource.url);
        setTitle(editResource.title);
        setTags([...editResource.tags]);
        setNotes(editResource.notes);
      } else {
        setUrl("");
        setTitle("");
        setTags([]);
        setNotes("");
      }
      setTitleResolved(false);
      setTitleError(false);
      setTitleResolving(false);
      setTagInput("");
      setSaving(false);
      setTimeout(() => urlRef.current?.focus(), 100);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [open, editResource]);

  // Focus trap — keep Tab cycling within the modal
  const handleModalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Auto-resolve title from URL (only for new resources)
  useEffect(() => {
    if (isEdit) return;
    if (!url) {
      setTitleResolved(false);
      setTitleError(false);
      setTitleResolving(false);
      return;
    }
    try {
      new URL(url);
    } catch {
      return;
    }

    setTitleResolving(true);
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
      } finally {
        setTitleResolving(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setTitleResolving(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, isEdit]);

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
      if (isEdit && editResource) {
        updateResource(editResource.id, { url, title, tags, notes });
        onSaved(editResource.id);
      } else {
        const resource = createResource({ url, title, tags, notes });
        onSaved(resource.id);
      }
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
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-dialog-title"
        onKeyDown={handleModalKeyDown}
      >
        <div
          ref={modalRef}
          className="bg-surface w-full max-w-[480px] rounded-2xl p-xl shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-lg">
            <h2 id="save-dialog-title" className="text-[22px] font-black text-text">
              {isEdit ? "Edit clippt" : "Save to your library"}
            </h2>
            <button
              onClick={onClose}
              className="text-[18px] text-text-faint hover:text-text transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-md">
            {/* URL */}
            <div>
              <label htmlFor="save-url" className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint block mb-1.5">
                URL
              </label>
              <input
                id="save-url"
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
                <label htmlFor="save-title" className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint">
                  Title
                </label>
                {titleResolving && (
                  <span className="text-[10px] font-medium text-text-faint flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border border-text-faint border-t-transparent rounded-full animate-spin" />
                    Resolving…
                  </span>
                )}
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
                id="save-title"
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
              <label htmlFor="save-tags" className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint block mb-1.5">
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
                  id="save-tags"
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
                <label htmlFor="save-notes" className="text-[10px] font-bold tracking-[0.04em] uppercase text-text-faint">
                  Notes
                </label>
                <span className="text-[10px] font-normal text-text-faint">
                  Optional
                </span>
              </div>
              <textarea
                id="save-notes"
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
              {saving ? "Saving..." : isEdit ? "Update clippt" : "Save to library"}
            </Button3D>
          </div>
        </div>
      </div>
    </>
  );
}
