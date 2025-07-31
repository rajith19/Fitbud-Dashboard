// src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string | null;
          avatar_url: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          status?: string | null;
        };
        Update: {
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          status?: string | null;
          updated_at?: string;
        };
      };
      user_blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
          reason?: string | null;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          reason?: string | null;
        };
        Update: {
          reason?: string | null;
        };
      };
    };
    Views: {
      UserBlocksWithProfiles: {
        Row: {
          id: string;
          created_at: string;
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
          reason?: string | null;
        };
      };
    };
    Functions: {
      get_blocked_users: {
        Args: {
          uuid: string;
          blocked_user_id: string;
          full_name: string;
        };
        Returns: {
          id: string;
          blocked_user_id: string;
          uuid: string;
          full_name: string;
        }[];
      };
      get_chats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      user_status: "active" | "inactive" | "blocked" | "pending";
      user_role: "admin" | "moderator" | "user";
    };
  };
}
