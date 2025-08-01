// src/components/BlockedTable/BlockedTableActions.tsx
"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/userStore";
import { handleError, handleSuccess } from "@/utils/errorHandling";
import type { BlockedRow } from "@/types";

interface BlockedTableActionsProps {
  row: BlockedRow;
  onActionComplete?: () => void;
}

export function BlockedTableActions({ row, onActionComplete }: BlockedTableActionsProps) {
  const { roles, user } = useUserStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const canUnblock = isAdmin || isModerator;

  const handleUnblock = async () => {
    if (!canUnblock || !user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blocked-users/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unblock user");
      }

      handleSuccess("User unblocked successfully");
      setShowConfirm(false);
      onActionComplete?.();
    } catch (error) {
      console.error("Error unblocking user:", error);
      handleError(error, "Failed to unblock user");
    } finally {
      setLoading(false);
    }
  };

  if (!canUnblock) {
    return <span className="text-xs text-gray-400">No actions available</span>;
  }

  return (
    <div className="flex gap-2">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="rounded bg-green-500 px-2 py-1 text-xs text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "Unblock"}
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            onClick={handleUnblock}
            disabled={loading}
            className="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "..." : "Confirm"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="rounded bg-gray-500 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
