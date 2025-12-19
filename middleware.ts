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

  // 1. Get User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const pathname = url.pathname;

  // 2. Define Route Categories
  const isAuthPage = ["/login", "/register", "/forgot-password"].some((p) =>
    pathname.startsWith(p)
  );
  const isResetPasswordPage = pathname.startsWith("/reset-password");
  const isPublicInvitation = pathname.startsWith("/staff/accept-invitation");

  // Protected roots
  const isProtected = ["/citizen", "/staff", "/supervisor", "/admin"].some(
    (p) => pathname.startsWith(p)
  );

  // 3. Handle Public/Auth Scenarios

  // Allow password reset flow regardless of session
  if (isResetPasswordPage) return response;

  // Allow public invitation pages if not logged in
  if (isPublicInvitation && !user) return response;

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !user) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Handle Authenticated User Routing
  if (user) {
    // If user is on an auth page, or we need to check role access for a protected route
    if (isAuthPage || isProtected) {
      try {
        // CALL THE RPC: Let Postgres calculate the correct path
        const { data: config, error } = await supabase.rpc(
          "rpc_get_dashboard_config"
        );

        if (error || !config || !config.authenticated) {
          // Fallback if RPC fails (shouldn't happen for valid users)
          console.error("Middleware RPC Error:", error);
          if (isAuthPage) return response; // Let them try to logout/login
          return NextResponse.redirect(new URL("/login", request.url));
        }

        const targetDashboard = config.dashboard_config.default_route;

        // SCENARIO A: User is on Login/Register but already logged in
        if (isAuthPage) {
          // Prevent redirect loop: Only redirect if not already there
          if (pathname !== targetDashboard) {
            return NextResponse.redirect(new URL(targetDashboard, request.url));
          }
          return response;
        }

        // SCENARIO B: User is on a protected route. Check if they are allowed.
        if (isProtected) {
          // Simple check: Does the current path start with one of their allowed portals?
          // e.g. path is /admin/users, available_portals is ['citizen', 'staff'] -> BLOCK
          const currentPortal = pathname.split("/")[1]; // "admin", "staff", etc.
          const allowedPortals = config.dashboard_config.available_portals;

          // Note: "dashboard" is a common shared route, strictly check portal prefixes
          const isAllowed = allowedPortals.includes(currentPortal);

          if (!isAllowed) {
            // Redirect to their default dashboard if they try to access unauthorized portal
            if (pathname !== targetDashboard) {
              return NextResponse.redirect(
                new URL(targetDashboard, request.url)
              );
            }
          }
        }
      } catch (err) {
        console.error("Middleware Exception:", err);
        // Fail safe to citizen dashboard
        if (pathname !== "/citizen/dashboard") {
          return NextResponse.redirect(
            new URL("/citizen/dashboard", request.url)
          );
        }
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
