// middleware.ts
// ✅ COMPLETE FIXED VERSION - No redirect loops + Public Accept Invitation

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const ROLE_CACHE = new Map<string, { roles: string[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function middleware(request: NextRequest) {
  // ✅ CRITICAL: Store the response from updateSession
  const response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define routes
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].some((p) => pathname.startsWith(p));

  // ✅ NEW: Allow public access to accept-invitation page
  const isPublicInvitationPage = pathname.startsWith("/staff/accept-invitation");

  const isProtectedRoute = ["/citizen", "/staff", "/admin"].some((p) =>
    pathname.startsWith(p)
  );

  // ✅ Allow unauthenticated access to accept-invitation page
  if (isPublicInvitationPage && !user) {
    return response;
  }

  // 1. Unauthenticated users on protected routes → redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated users on auth pages → redirect to appropriate dashboard
  if (user && isAuthPage) {
    try {
      const roles = await getUserRolesWithCache(supabase, user.id);
      let dashboardPath = "/citizen/dashboard";

      if (roles.includes("admin") || roles.includes("dept_head")) {
        dashboardPath = "/admin/dashboard";
      } else if (
        roles.some((r) =>
          ["dept_staff", "ward_staff", "field_staff", "call_center"].includes(r)
        )
      ) {
        dashboardPath = "/staff/dashboard";
      }

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch (error) {
      console.error("Middleware: Error fetching roles on auth page:", error);
      // On error, default to citizen dashboard
      return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
    }
  }

  // 3. Role-based access control for protected routes
  if (user && isProtectedRoute) {
    // ✅ Skip role check for accept-invitation page (user is creating account)
    if (isPublicInvitationPage) {
      return response;
    }

    try {
      const roles = await getUserRolesWithCache(supabase, user.id);

      // Admin routes - require admin or dept_head role
      if (pathname.startsWith("/admin")) {
        const hasAdminAccess =
          roles.includes("admin") || roles.includes("dept_head");

        if (!hasAdminAccess) {
          // Redirect to appropriate dashboard based on user's role
          const fallback = roles.some((r) =>
            ["dept_staff", "ward_staff", "field_staff", "call_center"].includes(
              r
            )
          )
            ? "/staff/dashboard"
            : "/citizen/dashboard";

          return NextResponse.redirect(new URL(fallback, request.url));
        }
        // User has admin access, allow the request
        return response;
      }

      // Staff routes - require staff-level role
      if (pathname.startsWith("/staff")) {
        const hasStaffAccess = roles.some((r) =>
          [
            "admin",
            "dept_head",
            "dept_staff",
            "ward_staff",
            "field_staff",
            "call_center",
          ].includes(r)
        );

        if (!hasStaffAccess) {
          return NextResponse.redirect(
            new URL("/citizen/dashboard", request.url)
          );
        }
        // User has staff access, allow the request
        return response;
      }

      // Citizen routes - all authenticated users can access
      // Just return the response, no additional checks needed
    } catch (error) {
      console.error("Middleware: Error checking roles:", error);

      // On error, block admin/staff routes but allow citizen routes
      if (pathname.startsWith("/admin") || pathname.startsWith("/staff")) {
        // ✅ Don't redirect accept-invitation page on error
        if (isPublicInvitationPage) {
          return response;
        }
        return NextResponse.redirect(
          new URL("/citizen/dashboard", request.url)
        );
      }
    }
  }

  // ✅ CRITICAL: Return the original response from updateSession
  // This ensures all session cookies are properly set
  return response;
}

/**
 * Fetch user roles with in-memory caching to reduce DB queries
 */
async function getUserRolesWithCache(
  supabase: any,
  userId: string
): Promise<string[]> {
  const now = Date.now();
  const cached = ROLE_CACHE.get(userId);

  // Return cached roles if still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.roles;
  }

  // Fetch fresh roles from database
  const roles = await getUserRoles(supabase, userId);

  // Cache for future requests
  ROLE_CACHE.set(userId, { roles, timestamp: now });

  return roles;
}

/**
 * Fetch user roles from database
 */
async function getUserRoles(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`role:roles(role_type, is_active)`)
      .eq("user_id", userId)
      .eq("role.is_active", true);

    if (error) {
      console.error("Error fetching user roles:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((ur: any) => ur.role?.role_type)
      .filter((rt: any) => rt && typeof rt === "string");
  } catch (error) {
    console.error("Exception fetching user roles:", error);
    return [];
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};