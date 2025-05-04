"use client";

import { useUserStore } from "@/lib/userStore";
import type { Database } from "@/types/supabase";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
type AuthContextType = {
  session: Session | null;
  user: User | null;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      const roles = data.session?.user?.user_metadata?.roles ?? [];

      setSession(data.session);
      setUser(u);

      // now two separate calls:
      useUserStore.getState().setUser(u);
      useUserStore.getState().setRoles(roles);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      const roles = session?.user?.user_metadata?.roles ?? [];

      setSession(session);
      setUser(u);

      useUserStore.getState().setUser(u);
      useUserStore.getState().setRoles(roles);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <AuthContext.Provider value={{ session, user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
