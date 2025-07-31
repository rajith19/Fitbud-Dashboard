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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Blocked Users Management
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {canManageBlocks ? "Admin/Moderator View" : "Read-only View"}
        </div>
      </div>

      {/* Search and Block Users Section */}
      {canManageBlocks && <UserSearchAndBlock onUserBlocked={handleUserBlocked} />}

      {/* Blocked Users Table */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Currently Blocked Users
        </h2>
        <BlockedTable key={refreshKey} />
      </div>
    </div>
  );
}
