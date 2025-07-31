// src/hooks/useUserManagement.ts
"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useUserStore } from "@/lib/userStore";
import type { UserProfile, UpdateUserData, BlockUserData, UnblockUserData } from "@/types";
import { handleError, handleSuccess, withErrorHandling } from "@/utils/errorHandling";

export function useUserManagement() {
  const { supabase } = useSupabase();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);

  /**
   * Get user profile by ID
   */
  const getUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      return withErrorHandling(async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        return data as UserProfile;
      }, "Failed to fetch user profile");
    },
    [supabase]
  );

  /**
   * Get current user's profile
   */
  const getCurrentUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;
    return getUserProfile(user.id);
  }, [user, getUserProfile]);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (userId: string, updates: UpdateUserData): Promise<boolean> => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) throw error;

        handleSuccess("Profile updated successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to update profile");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Update current user's profile
   */
  const updateCurrentUserProfile = useCallback(
    async (updates: UpdateUserData): Promise<boolean> => {
      if (!user) {
        handleError(new Error("No user logged in"));
        return false;
      }
      return updateUserProfile(user.id, updates);
    },
    [user, updateUserProfile]
  );

  /**
   * Get all users (admin only)
   */
  const getAllUsers = useCallback(
    async (
      page: number = 0,
      pageSize: number = 20
    ): Promise<{ users: UserProfile[]; total: number } | null> => {
      return withErrorHandling(async () => {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .range(from, to)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return {
          users: data as UserProfile[],
          total: count || 0,
        };
      }, "Failed to fetch users");
    },
    [supabase]
  );

  /**
   * Block a user
   */
  const blockUser = useCallback(
    async (blockData: BlockUserData): Promise<boolean> => {
      if (!user) {
        handleError(new Error("No user logged in"));
        return false;
      }

      setLoading(true);
      try {
        const { error } = await supabase.from("user_blocks").insert({
          blocker_id: user.id,
          blocked_id: blockData.blocked_id,
          reason: blockData.reason,
        });

        if (error) throw error;

        handleSuccess("User blocked successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to block user");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  /**
   * Unblock a user
   */
  const unblockUser = useCallback(
    async (unblockData: UnblockUserData): Promise<boolean> => {
      if (!user) {
        handleError(new Error("No user logged in"));
        return false;
      }

      setLoading(true);
      try {
        const { error } = await supabase
          .from("user_blocks")
          .delete()
          .eq("blocker_id", user.id)
          .eq("blocked_id", unblockData.blocked_id);

        if (error) throw error;

        handleSuccess("User unblocked successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to unblock user");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  /**
   * Check if a user is blocked
   */
  const isUserBlocked = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!user) return false;

      const result = await withErrorHandling(async () => {
        const { data, error } = await supabase
          .from("user_blocks")
          .select("id")
          .eq("blocker_id", user.id)
          .eq("blocked_id", userId)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"
        return !!data;
      });

      return result || false;
    },
    [supabase, user]
  );

  /**
   * Search users
   */
  const searchUsers = useCallback(
    async (query: string, limit: number = 10): Promise<UserProfile[]> => {
      const result = await withErrorHandling(async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);

        if (error) throw error;
        return data as UserProfile[];
      });

      return result || [];
    },
    [supabase]
  );

  /**
   * Update user role (admin only)
   */
  const updateUserRole = useCallback(
    async (userId: string, role: string): Promise<boolean> => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) throw error;

        handleSuccess("User role updated successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to update user role");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Update user status (admin only)
   */
  const updateUserStatus = useCallback(
    async (userId: string, status: string): Promise<boolean> => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) throw error;

        handleSuccess("User status updated successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to update user status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    loading,
    getUserProfile,
    getCurrentUserProfile,
    updateUserProfile,
    updateCurrentUserProfile,
    getAllUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    searchUsers,
    updateUserRole,
    updateUserStatus,
  };
}
