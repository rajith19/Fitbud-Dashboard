// src/types/index.ts

/**
 * A single “blocked relationship” record, including both blocker & blocked profiles
 */
export interface BlockedRow {
  id: string;
  created_at: string;

  blocker: {
    full_name: string;
    email: string;
  };

  blocked: {
    full_name: string;
    email: string;
  };
}

/**
 * If you need a standalone profile type elsewhere
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
}
