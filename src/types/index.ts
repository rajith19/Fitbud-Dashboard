// src/types/index.ts

/**
 * A single “blocked relationship” record, including both blocker & blocked profiles
 */
export interface BlockedRow {
  id: string;
  created_at: string;

  blocker: {
    id: string;
    full_name: string | null;
    email: string | null;
    profile_pic_url?: string | null;
    notification_enabled?: boolean;
  };

  blocked: {
    id: string;
    full_name: string | null;
    email: string | null;
    profile_pic_url?: string | null;
    notification_enabled?: boolean;
  };
}

/**
 * Enhanced user profile type matching UserProfiles table schema
 */
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  profile_pic_url: string | null;
  primary_activity: number | null;
  activities: number[] | null;
  description: string | null;
  referral_code: string | null;
  updated_at: string;
  fcm_token: string[] | null;
  notification_enabled: boolean;
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
  profile_pic_url?: string;
  description?: string;
  primary_activity?: number;
  activities?: number[];
  notification_enabled?: boolean;
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
