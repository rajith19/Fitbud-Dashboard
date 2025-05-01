"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function useSupabase() {
  const [supabase] = useState<SupabaseClient<Database>>(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();
  }, [supabase]);

  return { supabase, session };
}
