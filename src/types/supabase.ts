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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
        };
      };
    };
    Views: object;
    Functions: object;
    Enums: object;
  };
}
