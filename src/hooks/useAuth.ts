// src/hooks/useAuth.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/userStore";
import { handleError, handleSuccess, withErrorHandling } from "@/utils/errorHandling";

export function useAuth() {
  const router = useRouter();
  const { user, setUser, setRoles } = useUserStore();

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<boolean> => {
    return withErrorHandling(async () => {
      // 1. Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Clear user store
      setUser(null);
      setRoles([]);

      // 3. Clear any additional client-side data
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();

      // 4. Call the API to clear server-side cookies
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        // Don't fail the logout if API call fails
        console.warn("Failed to clear server-side session:", error);
      }

      handleSuccess("Signed out successfully");
      
      // 5. Redirect to sign in page
      router.push("/signin");
      
      return true;
    }, "Failed to sign out") || false;
  }, [router, setUser, setRoles]);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    return withErrorHandling(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.session && data.user) {
        setUser(data.user);
        setRoles(data.user.user_metadata?.role || []);
        return true;
      }

      return false;
    }, "Failed to refresh session") || false;
  }, [setUser, setRoles]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    return !!user;
  }, [user]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    const { roles } = useUserStore.getState();
    return roles.includes(role);
  }, []);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roleList: string[]): boolean => {
    const { roles } = useUserStore.getState();
    return roleList.some(role => roles.includes(role));
  }, []);

  /**
   * Get current user session
   */
  const getSession = useCallback(async () => {
    return withErrorHandling(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }, "Failed to get session");
  }, []);

  /**
   * Update user metadata
   */
  const updateUserMetadata = useCallback(async (metadata: Record<string, any>): Promise<boolean> => {
    return withErrorHandling(async () => {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        setRoles(data.user.user_metadata?.role || []);
      }
      
      handleSuccess("Profile updated successfully");
      return true;
    }, "Failed to update profile") || false;
  }, [setUser, setRoles]);

  /**
   * Change user password
   */
  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    return withErrorHandling(async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      handleSuccess("Password changed successfully");
      return true;
    }, "Failed to change password") || false;
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    return withErrorHandling(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      handleSuccess("Password reset email sent");
      return true;
    }, "Failed to send password reset email") || false;
  }, []);

  return {
    user,
    signOut,
    refreshSession,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    getSession,
    updateUserMetadata,
    changePassword,
    resetPassword,
  };
}
