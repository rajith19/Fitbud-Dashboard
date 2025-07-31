// src/types/index.ts

/**
 * A single “blocked relationship” record, including both blocker & blocked profiles
 */
export interface BlockedRow {
  id: string;
  created_at: string;
  reason?: string | null;

  blocker: {
    id: string;
    full_name: string;
    email: string;
  };

  blocked: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Enhanced user profile type with additional fields
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string | null;
}

/**
 * User management types
 */
export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: string;
  avatar_url?: string;
  status?: string;
}

/**
 * Block user types
 */
export interface BlockUserData {
  blocked_id: string;
  reason?: string;
}

export interface UnblockUserData {
  blocked_id: string;
}

/**
 * Form validation types
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  full_name?: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Loading and error state types
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
