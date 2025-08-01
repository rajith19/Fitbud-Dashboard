// src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      UserProfiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          profile_pic_url?: string | null;
          primary_activity?: number | null;
          activities?: number[] | null;
          description?: string | null;
          referral_code?: string | null;
          updated_at?: string;
          fcm_token?: string[] | null;
          notification_enabled?: boolean;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          profile_pic_url?: string | null;
          primary_activity?: number | null;
          activities?: number[] | null;
          description?: string | null;
          referral_code?: string | null;
          updated_at?: string;
          fcm_token?: string[] | null;
          notification_enabled?: boolean;
        };
      };
      UserBlocks: {
        Row: {
          id: string;
          user_id: string;
          blocked_user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          blocked_user_id: string;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          blocked_user_id?: string;
          created_at?: string | null;
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
