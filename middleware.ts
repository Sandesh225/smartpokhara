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
      // 2. Check for cached metadata to avoid RPC calls
      const metadataCookie = request.cookies.get("app-user-metadata")?.value;
      let profileCheck: any = null;
      let config: any = null;
      let metadataCached = false;

      if (metadataCookie) {
        try {
          const cached = JSON.parse(metadataCookie);
          // Simple validation: Ensure metadata is recent (e.g., less than 1 hour old)
          if (cached && cached.version === "1.0" && (Date.now() - cached.timestamp < 3600000)) {
            profileCheck = cached.profileCheck;
            config = cached.config;
            metadataCached = true;
          }
        } catch (e) {
          console.error("Error parsing metadata cookie:", e);
        }
      }

      // 3. Fetch metadata if not cached
      if (!metadataCached) {
        const [profileCheckRes, configRes] = await Promise.all([
          supabase.rpc("rpc_is_profile_complete"),
          supabase.rpc("rpc_get_dashboard_config"),
        ]);

        profileCheck = profileCheckRes.data;
        config = configRes.data;

        // 4. Update the response with the new metadata cookie
        // We'll set it for 1 hour to balance performance and eventual consistency
        if (profileCheck && config) {
          const metadataToCache = JSON.stringify({
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
        return NextResponse.redirect(new URL("/setup-profile", request.url));
      }

      // If profile is complete and on setup page, redirect to dashboard
      if (profileCheck?.is_complete && isSetupProfile) {
        const targetRoute =
          config?.dashboard_config?.default_route || "/citizen/dashboard";
        return NextResponse.redirect(new URL(targetRoute, request.url));
      }

      // Handle auth pages for logged-in users
      if (isAuthPage || isProtected) {
        if (!config || !config.authenticated) {
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
          const allowedPortals = config.dashboard_config.available_portals || [];
          const isAllowed = allowedPortals.includes(currentPortal);

          if (!isAllowed && pathname !== targetDashboard) {
            return NextResponse.redirect(new URL(targetDashboard, request.url));
          }
        }
      }
    } catch (err) {
      console.error("Middleware Exception:", err);
      if (isProtected) {
        return NextResponse.redirect(new URL("/login", request.url));
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
