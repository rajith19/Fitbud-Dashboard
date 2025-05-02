// app/api/auth/user/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  // 1) Wire up Supabase with our App-Router cookies adapter
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all incoming cookies
        getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
        // We’re not setting any cookies here, so no-op
        setAll: () => {
          /* no-op */
        },
      },
    }
  );

  // 2) Ask Supabase for the currently authenticated user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 3) If not authenticated, return 401
  if (error || !user) {
    return NextResponse.json({ error: error?.message ?? "Not authenticated" }, { status: 401 });
  }

  // 4) Otherwise return the user object
  return NextResponse.json(user, { status: 200 });
}
