import type { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true, // Enable automatic token refresh
      detectSessionInUrl: true,
      flowType: "pkce", // Use PKCE flow for better security
    },
  }
);
