// src/components/BlockedTable/BlockedTableActions.tsx
"use client";

import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserStore } from "@/lib/userStore";
import type { BlockedRow } from "@/types";

interface BlockedTableActionsProps {
  row: BlockedRow;
  onActionComplete?: () => void;
}

export function BlockedTableActions({ row, onActionComplete }: BlockedTableActionsProps) {
  const { unblockUser, loading } = useUserManagement();
  const { roles } = useUserStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const canUnblock = isAdmin || isModerator;

  const handleUnblock = async () => {
    if (!canUnblock) return;

    const success = await unblockUser({ blocked_id: row.blocked.id });
    if (success) {
      setShowConfirm(false);
      onActionComplete?.();
    }
  };

  if (!canUnblock) {
    return <span className="text-gray-400 text-xs">No actions available</span>;
  }

  return (
    <div className="flex gap-2">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Unblock"}
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            onClick={handleUnblock}
            disabled={loading}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Confirm"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
