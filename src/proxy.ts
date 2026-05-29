import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const currentPath = request.nextUrl.pathname;

  console.log("=================================");
  console.log("PROXY START:", currentPath);

  console.log(
    "SUPABASE URL:",
    env.NEXT_PUBLIC_SUPABASE_URL
  );


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

  console.log("FETCHING SESSION...");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION USER:", session?.user?.email);

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
    console.log("NO SESSION FOUND");

    if (isSellerRoute) {
      console.log("REDIRECTING TO SELLER LOGIN");
      return NextResponse.redirect(
        new URL(ROUTES.SELLER.LOGIN, request.url)
      );
    }

    if (isAdminRoute) {
      console.log("REDIRECTING TO ADMIN LOGIN");
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.LOGIN, request.url)
      );
    }
  } else {
    console.log("SESSION EXISTS");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);

    const role = profile?.role ?? ROLES.BUYER;

    console.log("ROLE:", role);

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
        console.log("SELLER DETECTED -> DASHBOARD");
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
      console.log("SELLER ROUTE BLOCKED");
      return NextResponse.redirect(
        new URL(ROUTES.HOME, request.url)
      );
    }

    if (
      isAdminRoute &&
      role !== ROLES.ADMIN
    ) {
      console.log("ADMIN ROUTE BLOCKED");
      return NextResponse.redirect(
        new URL(ROUTES.HOME, request.url)
      );
    }
  }

  console.log("ALLOWING REQUEST");
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
