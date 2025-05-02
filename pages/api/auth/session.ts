// pages/api/auth/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // 1) pull keepLoggedIn out of the body _before_ creating the client
  const {
    access_token,
    refresh_token,
    keepLoggedIn = false, // default false if omitted
  } = req.body as {
    access_token: string;
    refresh_token: string;
    keepLoggedIn?: boolean;
  };

  // 2) build a Supabase client whose `setAll` knows about keepLoggedIn
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          Object.entries(req.cookies || {}).map(([name, value]) => ({
            name,
            value,
            options: { path: "/" },
          })),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            // base parts
            const parts = [`${name}=${value}`, `Path=${options.path}`, `HttpOnly`];
            // preserve sameSite / secure if present
            if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options.secure) parts.push(`Secure`);

            // **only** if “keep me logged in” is checked, add Max-Age
            if (keepLoggedIn) {
              const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
              parts.push(`Max-Age=${thirtyDaysInSeconds}`);
            }

            // write the header
            res.setHeader("Set-Cookie", parts.join("; "));
          });
        },
      },
    }
  );

  // 3) let Supabase generate the proper cookies (via our setAll above)
  await supabase.auth.setSession({ access_token, refresh_token });

  return res.status(200).end();
}
