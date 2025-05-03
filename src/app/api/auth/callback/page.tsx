"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data.session) {
        const resp = await fetch("/api/auth/session", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            keepLoggedIn: false,
          }),
        });

        if (!resp.ok) {
          toast.error("Failed to finalize authentication.");
          router.replace("/signin");
          return;
        }

        toast.success("Signed in successfully!");
        router.replace("/admin");
      } else {
        toast.error("Authentication failed, please try again.");
        router.replace("/signin");
      }

      if (error) {
        console.error("OAuth callback error:", error);
        toast.error(error.message);
        router.replace("/signin");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      Authenticating...
    </div>
  );
}
