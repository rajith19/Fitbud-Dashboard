// middleware.ts  ← at project root, NOT inside src/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          // only name & value exist on RequestCookie
          request.cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              // use whatever options Supabase gave you—
              // path/httpOnly/etc. are valid here
              ...options,
            })
          ),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // …role checks, etc.

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
