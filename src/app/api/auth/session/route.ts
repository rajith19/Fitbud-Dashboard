// app/api/auth/session/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1) parse incoming tokens + keep-logged-in flag
    const {
      access_token,
      refresh_token,
      keepLoggedIn = false,
    } = (await request.json()) as {
      access_token: string;
      refresh_token: string;
      keepLoggedIn?: boolean;
    };

    // 2) determine original destination and build absolute URL
    const url = new URL(request.url);
    const fromPath = url.searchParams.get("from") || "/admin";
    const destination = new URL(fromPath, url.origin);

    // 3) prepare a JSON response so we can attach cookies and return the destination
    const response = NextResponse.json({ redirectTo: destination.toString() }, { status: 200 });

    // 4) initialize Supabase server client with cookie handlers
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
                httpOnly: true,
                ...(keepLoggedIn ? { maxAge: 60 * 60 * 24 * 30 } : {}),
              })
            ),
        },
      }
    );

    // 5) let Supabase drop the auth-token cookie
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      console.error("Supabase setSession error:", error);
      return NextResponse.error();
    }

    // 6) explicitly set the HTTP-only refresh-token cookie
    const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || "gnqandyaeuclyxsqccvl";
    response.cookies.set(`sb-${PROJECT_REF}-refresh-token`, refresh_token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      ...(keepLoggedIn ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    return response;
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
