"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState, useMemo } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
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

  // 2) React state to hold the user
  //    instead of `{ user: any } | null` we use the proper `User` type
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      // <-- annotate the fetched JSON as a Supabase User
      .then((user: User | null) => {
        if (user) setSession({ user });
      })
      .catch(console.error);
  }, []);

  return { supabase, session };
}
