// File: pages/api/auth/signout.ts
import type { NextApiRequest, NextApiResponse } from "next";

// We’re not using auth-helpers here; we’ll hit the Supabase logout endpoint
// and then manually clear the two HTTP-only cookies Supabase set.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Call the Supabase logout endpoint to invalidate the session:
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: {
      // pass the auth-token cookie from the client
      Authorization: `Bearer ${req.cookies["sb-gnqandyaeuclyxsqccvl-auth-token"]}`,
      "Content-Type": "application/json",
    },
  });

  // 2) Clear BOTH cookies that hold your session:
  res.setHeader("Set-Cookie", [
    // replace <YOUR-PROJECT-REF> with your actual Supabase ref
    `sb-gnqandyaeuclyxsqccvl-auth-token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
    `sb-gnqandyaeuclyxsqccvl-refresh-token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
  ]);

  // 3) 204 No Content → done
  return res.status(204).end();
}
