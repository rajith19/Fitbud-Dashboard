"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    async function finalizeAuth() {
      // 1) supabase.auth.getSession() now returns your new session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("OAuth callback error:", error);
        toast.error(error?.message || "Authentication failed.");
        return router.replace("/signin");
      }

      // 2) Optionally POST to /api/auth/session for HTTP-only cookies
      const from = params?.get("from") ?? "/admin";
      const resp = await fetch(`/api/auth/session?from=${encodeURIComponent(from)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          keepLoggedIn: false,
        }),
      });
      if (!resp.ok) {
        toast.error("Failed to finalize authentication.");
        return router.replace("/signin");
      }

      // 3) Redirect on success
      const { redirectTo } = await resp.json();
      toast.success("Signed in successfully!");
      router.replace(redirectTo || "/admin");
    }

    finalizeAuth();
  }, [router, params]);

  return <div className="flex h-screen items-center justify-center">Authenticating…</div>;
}
