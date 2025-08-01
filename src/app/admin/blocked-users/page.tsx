// app/admin/blocked-users/page.tsx
"use client";

import { useState, useCallback } from "react";
import { BlockedTable } from "@/components/BlockedTable/BlockedTable";
import { UserSearchAndBlock } from "@/components/user-management/UserSearchAndBlock";
import { useUserStore } from "@/lib/userStore";

export default function BlockedUsersPage() {
  const { roles } = useUserStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const canManageBlocks = isAdmin || isModerator;

  const handleUserBlocked = useCallback(() => {
    // Refresh the blocked users table
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blocked Users Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isAdmin
              ? "Admin View - All blocking relationships in the system"
              : isModerator
                ? "Moderator View - Manage user blocks"
                : "View blocked users"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {canManageBlocks ? "Management Access" : "Read-only Access"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Role: {roles.join(", ") || "user"}
          </div>
        </div>
      </div>

      {/* Search and Block Users Section */}
      {canManageBlocks && <UserSearchAndBlock onUserBlocked={handleUserBlocked} />}

      {/* Blocked Users Table */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isAdmin ? "All Blocking Relationships" : "Blocked Users"}
          </h2>
          {isAdmin && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing all blocks system-wide
            </div>
          )}
        </div>
        <BlockedTable key={refreshKey} />
      </div>
    </div>
  );
}
