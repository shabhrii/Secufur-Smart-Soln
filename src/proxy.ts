import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const currentPath = request.nextUrl.pathname;

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // handled by updateSession
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

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
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const role = profile?.role ?? ROLES.BUYER;

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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
