// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/userStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallbackPath = "/signin",
  loadingComponent 
}: AuthGuardProps) {
  const { user, roles } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!user) {
        router.push(fallbackPath);
        return;
      }

      // Check if user has required roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
        if (!hasRequiredRole) {
          router.push("/unauthorized");
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [user, roles, requiredRoles, router, fallbackPath]);

  if (isLoading) {
    return loadingComponent || (
      <LoadingSpinner 
        fullScreen 
        text="Checking authentication..." 
        size="lg" 
      />
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}

// Role-based component wrapper
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { roles } = useUserStore();
  
  const hasPermission = allowedRoles.some(role => roles.includes(role));
  
  if (!hasPermission) {
    return fallback || (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-yellow-800 dark:text-yellow-200">
            You don't have permission to access this feature.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for checking permissions
export function usePermissions() {
  const { user, roles } = useUserStore();

  const hasRole = (role: string) => roles.includes(role);
  
  const hasAnyRole = (roleList: string[]) => 
    roleList.some(role => roles.includes(role));
  
  const isAdmin = () => roles.includes("admin");
  
  const isModerator = () => roles.includes("moderator");
  
  const canManageUsers = () => hasAnyRole(["admin", "moderator"]);
  
  const canBlockUsers = () => hasAnyRole(["admin", "moderator"]);

  return {
    user,
    roles,
    hasRole,
    hasAnyRole,
    isAdmin: isAdmin(),
    isModerator: isModerator(),
    canManageUsers: canManageUsers(),
    canBlockUsers: canBlockUsers(),
  };
}
