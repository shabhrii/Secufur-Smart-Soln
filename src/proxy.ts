import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export async function proxy(request: NextRequest) {
  // 1. Refresh session
  const response = await updateSession(request);
  
  // 2. Fetch the current session and profile for route protection
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // This is just for reading the session, updateSession handles setting cookies
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const currentPath = request.nextUrl.pathname;
  
  // Define protected routes
  const isSellerRoute = currentPath.startsWith("/seller") && 
    !currentPath.startsWith(ROUTES.SELLER.LOGIN) && 
    !currentPath.startsWith(ROUTES.SELLER.REGISTER) && 
    currentPath !== ROUTES.SELLER.HOME;
    
  const isAdminRoute = currentPath.startsWith("/admin");
  const isAuthRoute = currentPath.startsWith(ROUTES.AUTH.LOGIN) || currentPath.startsWith(ROUTES.AUTH.REGISTER);

  // If no session, redirect protected routes to appropriate login
  if (!session) {
    if (isSellerRoute) {
      return NextResponse.redirect(new URL(ROUTES.SELLER.LOGIN, request.url));
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
  } else {
    // Session exists, let's get the user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
      
    const role = profile?.role || ROLES.BUYER;

    // Prevent authenticated users from visiting auth pages
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
    if (currentPath.startsWith(ROUTES.SELLER.LOGIN) || currentPath.startsWith(ROUTES.SELLER.REGISTER)) {
      return NextResponse.redirect(new URL(ROUTES.SELLER.DASHBOARD, request.url));
    }

    // Role-based protection
    if (isSellerRoute && role !== ROLES.SELLER && role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
    if (isAdminRoute && role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
