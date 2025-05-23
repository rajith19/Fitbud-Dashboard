// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Database } from "@/types/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { useUserStore } from "@/lib/userStore";

// Initialize Supabase client with auth options for hash parsing and session persistence
const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);

type AuthContextType = {
  session: Session | null;
  user: User | null;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => supabaseClient, []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // helper to pull roles out of user_metadata
  function normalizeRoles(meta: unknown): string[] {
    if (!meta || typeof meta !== "object") return [];
    const m = meta as Record<string, unknown>;
    if (Array.isArray(m.roles) && m.roles.every((r) => typeof r === "string")) {
      return m.roles as string[];
    }
    if (typeof m.role === "string") {
      return [m.role];
    }
    return [];
  }

  useEffect(() => {
    // 1️⃣ on mount, get the current session (including hash-parsed)
    supabase.auth.getSession().then(({ data }) => {
      const sess = data.session;
      const u = sess?.user ?? null;
      const roles = normalizeRoles(u?.user_metadata);

      setSession(sess);
      setUser(u);
      useUserStore.getState().setUser(u);
      useUserStore.getState().setRoles(roles);
    });

    // 2️⃣ subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      const u = sess?.user ?? null;
      const roles = normalizeRoles(u?.user_metadata);

      setSession(sess);
      setUser(u);
      useUserStore.getState().setUser(u);
      useUserStore.getState().setRoles(roles);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <AuthContext.Provider value={{ session, user }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
