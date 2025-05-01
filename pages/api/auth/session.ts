// pages/api/auth/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // read whatever cookies came in
        getAll: () =>
          Object.entries(req.cookies || {}).map(([name, value]) => ({
            name,
            value,
            options: { path: "/" },
          })),
        // write Set‐Cookie headers for the new session
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            // you can expand options (maxAge, secure, sameSite, etc.)
            res.setHeader("Set-Cookie", `${name}=${value}; Path=${options.path}; HttpOnly;`);
          });
        },
      },
    }
  );

  const { access_token, refresh_token } = req.body as {
    access_token: string;
    refresh_token: string;
  };

  // this writes sb-access-token & sb-refresh-token cookies
  await supabase.auth.setSession({ access_token, refresh_token });
  return res.status(200).end();
}
