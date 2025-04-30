"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { createContext, useContext } from "react";

type AuthContextType = {
  name: string | null;
  email: string | null;
  role: string | null;
  profileImage: string | null;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const user = session?.user;

  const value = {
    name: user?.user_metadata?.full_name ?? null,
    email: user?.email ?? null,
    role: user?.user_metadata?.role ?? null,
    profileImage: user?.user_metadata?.avatar_url ?? null,
    isLoggedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
