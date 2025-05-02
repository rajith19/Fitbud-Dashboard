// app/api/auth/session/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      access_token,
      refresh_token,
      keepLoggedIn = false,
    } = (await request.json()) as {
      access_token: string;
      refresh_token: string;
      keepLoggedIn?: boolean;
    };

    // figure out where to send them after login...
    // default to `/` if there's no `from` param
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("from") || "/";

    // 1) create a redirect response
    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    // 2) wire up Supabase to drop the auth-token
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
          setAll: (cookies) =>
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                path: options?.path ?? "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: false,
                ...(keepLoggedIn ? { maxAge: 60 * 60 * 24 * 30 } : {}),
              })
            ),
        },
      }
    );

    // 3) have Supabase drop the auth-token cookie
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 4) manually set the refresh-token HTTP-only
    const PROJECT_REF = "gnqandyaeuclyxsqccvl"; // your actual ref
    response.cookies.set(`sb-${PROJECT_REF}-refresh-token`, refresh_token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      ...(keepLoggedIn ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    // 5) return the redirect (with both cookies attached)
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
