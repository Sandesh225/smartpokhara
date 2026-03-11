// ============================================================================
// FILE 3: middleware.ts (UPDATED)
// ============================================================================
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  // Allow password reset right away without hitting the database
  if (isResetPasswordPage) return response;

  // Optimization: If the route is completely public and not related to our auth flows or protected areas, 
  // skip the expensive Supabase API calls completely to prevent Edge Network 504 Timeouts.
  if (!isAuthPage && !isPublicInvitation && !isSetupProfile && !isProtected) {
    return response;
  }

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

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicInvitation && !user) return response;

  // Helper to handle redirects while ensuring cookie propagation
  const performRedirect = (target: string) => {
    const redirectResponse = NextResponse.redirect(new URL(target, request.url));
    // Propagate all cookies from the base 'response' to the 'redirect' response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // Redirect unauthenticated users
  if (isProtected && !user) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return performRedirect(redirectUrl.pathname + redirectUrl.search);
  }

  // Handle authenticated users
  if (user) {
    try {
      // 2. Check for cached metadata to avoid RPC calls
      // Bypass cache on setup-profile to ensure we detect completion immediately
      const metadataCookie = request.cookies.get("app-user-metadata")?.value;
      let profileCheck: any = null;
      let config: any = null;
      let metadataCached = false;

      if (metadataCookie && !isSetupProfile) {
        try {
          const cached = JSON.parse(metadataCookie);
          if (cached && cached.version === "1.0" && cached.userId === user.id && (Date.now() - cached.timestamp < 3600000)) {
            profileCheck = cached.profileCheck;
            config = cached.config;
            
            // CRITICAL: If cache says incomplete but user IS on a protected route, 
            // force a fresh check to avoid stale redirect loops
            if (profileCheck?.is_complete === false) {
              console.log("[Middleware] Profile marked incomplete in cache, forcing fresh check to verify.");
              metadataCached = false; 
            } else {
              metadataCached = true;
            }
          }
        } catch (e) {
          console.error("Error parsing metadata cookie:", e);
        }
      }

      // 3. Fetch metadata if not cached
      if (!metadataCached) {
        console.log(`[Middleware] Fetching fresh metadata for user: ${user.id}`);
        const [profileCheckRes, configRes] = await Promise.all([
          supabase.rpc("rpc_is_profile_complete"),
          supabase.rpc("rpc_get_dashboard_config"),
        ]);

        profileCheck = profileCheckRes.data;
        config = configRes.data;

        // 4. Update the response with the new metadata cookie
        if (profileCheck && config) {
          const metadataToCache = JSON.stringify({
            userId: user.id,
            profileCheck,
            config,
            timestamp: Date.now(),
            version: "1.0"
          });
          
          response.cookies.set("app-user-metadata", metadataToCache, {
            path: "/",
            maxAge: 3600,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }
      }

      // Redirection logic using profileCheck and config
      
      // If profile is incomplete and not on setup page, redirect to setup
      if (!profileCheck?.is_complete && !isSetupProfile) {
        console.log(`[Middleware] Profile incomplete, redirecting to /setup-profile`);
        return performRedirect("/setup-profile");
      }

      // If profile is complete and on setup page, redirect to dashboard
      if (profileCheck?.is_complete && isSetupProfile) {
        const targetRoute = config?.dashboard_config?.default_route || "/citizen/dashboard";
        
        if (pathname === targetRoute) {
          console.log(`[Middleware] Profile complete and already on target route: ${targetRoute}`);
          return response;
        }

        console.log(`[Middleware] Profile complete, redirecting from /setup-profile to: ${targetRoute}`);
        return performRedirect(targetRoute);
      }

      // Handle auth pages (login/register) for already logged-in users
      if (isAuthPage) {
        const targetDashboard = config?.dashboard_config?.default_route || "/citizen/dashboard";
        if (pathname !== targetDashboard) {
          console.log(`[Middleware] Auth page bypass for logged-in user -> ${targetDashboard}`);
          return performRedirect(targetDashboard);
        }
        return response;
      }

      // Final check for protected routes
      if (isProtected) {
        if (!config || !config.authenticated) {
          console.log(`[Middleware] Config says not authenticated, forcing login`);
          return performRedirect("/login");
        }

        const currentPortal = pathname.split("/")[1];
        const allowedPortals = config.dashboard_config?.available_portals || [];
        const isAllowed = allowedPortals.includes(currentPortal);
        const targetDashboard = config.dashboard_config.default_route;

        if (!isAllowed && pathname !== targetDashboard) {
          console.warn(`[Middleware] Portal ${currentPortal} restricted. Routing to default: ${targetDashboard}`);
          return performRedirect(targetDashboard);
        }
      }
    } catch (err) {
      console.error("Middleware Exception:", err);
      if (isProtected) return performRedirect("/login");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
