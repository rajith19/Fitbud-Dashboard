"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function useSupabase() {
  // 1) Create the Supabase browser client (for DB queries)
  const supabase = useMemo<SupabaseClient<Database>>(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  // 2) React state to hold the session/user
  //    We’ll fetch it via our API so HTTP-only cookies are read.
  const [session, setSession] = useState<{ user: any } | null>(null);

  useEffect(() => {
    // Fetch the current user from our cookie-backed endpoint
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => user && setSession({ user }))
      .catch(console.error);
  }, []);

  return { supabase, session };
}
