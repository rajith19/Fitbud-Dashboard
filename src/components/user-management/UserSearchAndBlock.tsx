// src/components/user-management/UserSearchAndBlock.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserStore } from "@/lib/userStore";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { validateBlockReason } from "@/utils/validation";
import type { UserProfile, FormErrors } from "@/types";

interface UserSearchAndBlockProps {
  onUserBlocked?: () => void;
}

export function UserSearchAndBlock({ onUserBlocked }: UserSearchAndBlockProps) {
  const { searchUsers, blockUser, isUserBlocked, loading } = useUserManagement();
  const { roles } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const canBlockUsers = isAdmin || isModerator;

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = await searchUsers(query, 10);
    setSearchResults(results);

    // Check which users are already blocked
    const blockedSet = new Set<string>();
    for (const user of results) {
      const blocked = await isUserBlocked(user.id);
      if (blocked) {
        blockedSet.add(user.id);
      }
    }
    setBlockedUsers(blockedSet);
  }, [searchUsers, isUserBlocked]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    // Validate reason
    const reasonError = validateBlockReason(blockReason);
    if (reasonError) {
      setErrors({ reason: reasonError });
      return;
    }

    const success = await blockUser({
      blocked_id: selectedUser.id,
      reason: blockReason.trim() || undefined,
    });

    if (success) {
      setShowBlockForm(false);
      setSelectedUser(null);
      setBlockReason("");
      setErrors({});
      setBlockedUsers(prev => new Set([...prev, selectedUser.id]));
      onUserBlocked?.();
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowBlockForm(true);
    setBlockReason("");
    setErrors({});
  };

  const handleCancel = () => {
    setShowBlockForm(false);
    setSelectedUser(null);
    setBlockReason("");
    setErrors({});
  };

  if (!canBlockUsers) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          You don't have permission to block users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search and Block Users
        </h2>

        {/* Search Input */}
        <div className="mb-4">
          <Label>Search Users</Label>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Search Results
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.full_name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Role: {user.role || "user"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {blockedUsers.has(user.id) ? (
                      <span className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                        Already Blocked
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleSelectUser(user)}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={loading}
                      >
                        Block User
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Form Modal */}
        {showBlockForm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Block User
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedUser.full_name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser.email}
                </p>
              </div>

              <form onSubmit={handleBlockUser} className="space-y-4">
                <div>
                  <Label>Reason for blocking (optional)</Label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason for blocking this user..."
                    rows={3}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {loading ? "Blocking..." : "Block User"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
