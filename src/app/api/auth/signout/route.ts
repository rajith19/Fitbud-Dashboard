// src/app/api/auth/signout/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Initialize Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
          setAll: (cookies) =>
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            ),
        },
      }
    );

    // Sign out from Supabase (this will clear the auth cookies)
    await supabase.auth.signOut();

    // Manually clear any remaining auth cookies
    const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || "gnqandyaeuclyxsqccvl";
    
    response.cookies.set(`sb-${PROJECT_REF}-auth-token`, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set(`sb-${PROJECT_REF}-refresh-token`, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
