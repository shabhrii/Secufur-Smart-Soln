import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export async function proxy(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // Bypass static files and API routes (or let the matcher handle it)
  // The matcher already bypasses most statics, but just in case.

  const response = await updateSession(request);

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let role: string = ROLES.BUYER;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (profile?.role) {
      role = profile.role;
    }
  }

  // 1. Maintenance Mode Check
  // We fetch settings. If table doesn't exist, it falls back gracefully (returns error).
  if (currentPath !== "/maintenance") {
    const { data: settings } = await supabase
      .from("marketplace_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .maybeSingle();

    if (settings?.maintenance_mode && role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } else if (currentPath === "/maintenance") {
    // If we are on /maintenance, check if we need to be here
    const { data: settings } = await supabase
      .from("marketplace_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .maybeSingle();

    if (!settings?.maintenance_mode || role === ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // 2. Auth & Roles Enforcement
  const isSellerRoute =
    currentPath.startsWith("/seller") &&
    !currentPath.startsWith(ROUTES.SELLER.LOGIN) &&
    !currentPath.startsWith(ROUTES.SELLER.REGISTER) &&
    currentPath !== ROUTES.SELLER.HOME;

  const isAdminRoute = currentPath.startsWith("/admin");

  const isAuthRoute =
    currentPath.startsWith(ROUTES.AUTH.LOGIN) ||
    currentPath.startsWith(ROUTES.AUTH.REGISTER);

  if (!session) {
    if (isSellerRoute) {
      return NextResponse.redirect(
        new URL(ROUTES.SELLER.LOGIN, request.url)
      );
    }

    if (isAdminRoute) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.LOGIN, request.url)
      );
    }
  } else {
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(ROUTES.HOME, request.url)
      );
    }

    if (
      currentPath.startsWith(ROUTES.SELLER.LOGIN) ||
      currentPath.startsWith(ROUTES.SELLER.REGISTER)
    ) {
      if (
        role === ROLES.SELLER ||
        role === ROLES.ADMIN
      ) {
        return NextResponse.redirect(
          new URL(ROUTES.SELLER.DASHBOARD, request.url)
        );
      }
    }

    if (
      isSellerRoute &&
      role !== ROLES.SELLER &&
      role !== ROLES.ADMIN
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.HOME, request.url)
      );
    }

    if (
      isAdminRoute &&
      role !== ROLES.ADMIN
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.HOME, request.url)
      );
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
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
