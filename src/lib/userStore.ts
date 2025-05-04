import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile?: { first_name: string; last_name: string };
  roles: string[]; // ← add roles here
  setUser: (u: User | null) => void;
  setProfile: (p: { first_name: string; last_name: string }) => void;
  setRoles: (roles: string[]) => void; // ← setter for roles
}

export const useUserStore = create<AuthState>((set) => ({
  user: null,
  profile: undefined,
  roles: [], // ← initialize roles
  setUser: (u) => set({ user: u }),
  setProfile: (p) => set({ profile: p }),
  setRoles: (roles) => set({ roles }),
}));
