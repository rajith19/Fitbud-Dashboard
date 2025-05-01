import { createClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const supabase = createClient(req);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow unauthenticated access only to auth pages
  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");

  if (!session) {
    if (!isAuthPage) {
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Role-based route protection (example: /admin should only be accessed by 'admin')
  const userRole = session.user.user_metadata?.role;

  if (pathname.startsWith("/admin") && userRole !== "admin") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
