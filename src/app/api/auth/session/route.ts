// app/api/auth/session/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1) parse the incoming tokens + keep-logged-in flag
    const {
      access_token,
      refresh_token,
      keepLoggedIn = false,
    } = (await request.json()) as {
      access_token: string;
      refresh_token: string;
      keepLoggedIn?: boolean;
    };

    // 2) figure out where to send them on success
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("from") || "/";

    // 3) prepare a JSON response so we can attach cookies
    const response = NextResponse.json({ redirectTo }, { status: 200 });

    // 4) wire up Supabase to set the auth-token cookie
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

    // 5) let Supabase drop the auth-token
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) {
      console.error("Supabase setSession error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6) manually drop the refresh-token HTTP-only
    const PROJECT_REF = "gnqandyaeuclyxsqccvl";
    response.cookies.set(`sb-${PROJECT_REF}-refresh-token`, refresh_token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      ...(keepLoggedIn ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
