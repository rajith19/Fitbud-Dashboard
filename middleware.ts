// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  const isPublic = ["/signin", "/signup", "/unauthorized"].some((route) =>
    pathname.startsWith(route)
  );

  if (isPublic) return res;

  // If no session, redirect to signin
  if (!session) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Role-based access: protect /admin for 'admin' only
  const role = session.user.user_metadata.role;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|assets|.*\\..*).*)"],
};
