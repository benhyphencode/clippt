"use client";

import { useState } from "react";
import { SaveCardV2 } from "./save-card-v2";
import { SaveDialogV2 } from "./save-dialog-v2";
import type { SaveWithDetails } from "@/lib/supabase/types";

interface EditableSaveCardProps {
  save: SaveWithDetails;
  currentUserId: string;
  hideUser?: boolean;
  hideUrl?: boolean;
}

/**
 * SaveCard with an edit button overlay.
 * Only shows the edit button if the save belongs to the current user.
 */
export function EditableSaveCard({
  save,
  currentUserId,
  hideUser = false,
  hideUrl = false,
}: EditableSaveCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwn = save.user_id === currentUserId;

  return (
    <div className="relative group/editable">
      <SaveCardV2
        save={save}
        hideUser={hideUser}
        hideUrl={hideUrl}
      />

      {isOwn && (
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-3 right-3 opacity-0 group-hover/editable:opacity-100 transition-opacity h-7 px-2.5 rounded-md bg-surface-alt border border-border text-[12px] font-medium text-text-muted hover:text-text hover:border-border-strong"
        >
          Edit
        </button>
      )}

      <SaveDialogV2
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentUserId={currentUserId}
        editSave={save}
      />
    </div>
  );
}
