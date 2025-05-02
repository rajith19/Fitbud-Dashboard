import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).setHeader("Allow", "GET").end();
  }

  // 1) Create a Supabase server client bound to this req/res
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value,
            options: { path: "/", httpOnly: true },
          })),
        setAll: () => {
          /* no-op */
        },
      },
    }
  );

  // 2) Re-validate token & get user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return res.status(401).json({ error: error?.message ?? "Not authenticated" });
  }

  // 3) Return the user object
  res.status(200).json(user);
}
