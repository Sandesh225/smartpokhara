// ============================================================================
// FILE 3: middleware.ts (UPDATED)
// ============================================================================
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const pathname = url.pathname;

  const isAuthPage = ["/login", "/register", "/forgot-password"].some((p) =>
    pathname.startsWith(p)
  );
  const isResetPasswordPage = pathname.startsWith("/reset-password");
  const isPublicInvitation = pathname.startsWith("/staff/accept-invitation");
  const isSetupProfile = pathname.startsWith("/setup-profile");

  const isProtected = ["/citizen", "/staff", "/supervisor", "/admin"].some(
    (p) => pathname.startsWith(p)
  );

  // Allow password reset and public pages
  if (isResetPasswordPage) return response;
  if (isPublicInvitation && !user) return response;

  // Redirect unauthenticated users
  if (isProtected && !user) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle authenticated users
  if (user) {
    try {
      // Check profile completion status
      const { data: profileCheck } = await supabase.rpc(
        "rpc_is_profile_complete"
      );

      // If profile is incomplete and not on setup page, redirect to setup
      if (!profileCheck?.is_complete && !isSetupProfile) {
        return NextResponse.redirect(new URL("/setup-profile", request.url));
      }

      // If profile is complete and on setup page, redirect to dashboard
      if (profileCheck?.is_complete && isSetupProfile) {
        const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
        const targetRoute =
          config?.dashboard_config?.default_route || "/citizen/dashboard";
        return NextResponse.redirect(new URL(targetRoute, request.url));
      }

      // Handle auth pages for logged-in users
      if (isAuthPage || isProtected) {
        const { data: config, error } = await supabase.rpc(
          "rpc_get_dashboard_config"
        );

        if (error || !config || !config.authenticated) {
          console.error("Middleware RPC Error:", error);
          if (isAuthPage) return response;
          return NextResponse.redirect(new URL("/login", request.url));
        }

        const targetDashboard = config.dashboard_config.default_route;

        // Redirect from auth pages to dashboard
        if (isAuthPage) {
          if (pathname !== targetDashboard) {
            return NextResponse.redirect(new URL(targetDashboard, request.url));
          }
          return response;
        }

        // Check portal access for protected routes
        if (isProtected) {
          const currentPortal = pathname.split("/")[1];
          const allowedPortals = config.dashboard_config.available_portals;
          const isAllowed = allowedPortals.includes(currentPortal);

          if (!isAllowed && pathname !== targetDashboard) {
            return NextResponse.redirect(new URL(targetDashboard, request.url));
          }
        }
      }
    } catch (err) {
      console.error("Middleware Exception:", err);
      if (pathname !== "/citizen/dashboard") {
        return NextResponse.redirect(
          new URL("/citizen/dashboard", request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
