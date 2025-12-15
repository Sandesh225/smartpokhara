// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const ROLE_CACHE = new Map<string, { roles: string[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000;

export async function middleware(request: NextRequest) {
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

  const isAuthPage = ["/login", "/register", "/forgot-password"].some((p) =>
    pathname.startsWith(p)
  );

  const isResetPasswordPage = pathname.startsWith("/reset-password");
  const isPublicInvitationPage = pathname.startsWith(
    "/staff/accept-invitation"
  );
  const isProtectedRoute = ["/citizen", "/staff", "/admin"].some((p) =>
    pathname.startsWith(p)
  );

  // CRITICAL: Always allow access to reset-password page
  // Let the page itself handle session validation
  // middleware.ts (update the reset password section)
  if (isResetPasswordPage) {
    console.log("🔐 Allowing access to reset-password page");

    // Check if user is in password reset flow
    const passwordResetCookie = request.cookies.get("password-reset-flow");

    if (!user && !passwordResetCookie) {
      // User might be coming from email link - let them through
      console.log("👤 User might be in password reset flow, allowing access");
    }

    return response;
  }
  // Allow unauthenticated access to invitation page
  if (isPublicInvitationPage && !user) {
    return response;
  }

  // Redirect unauthenticated users from protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth pages to their dashboard
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

      console.log(
        "📍 Redirecting authenticated user from",
        pathname,
        "to",
        dashboardPath
      );
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
    }
  }

  // Role-based access control for protected routes
  if (user && isProtectedRoute && !isPublicInvitationPage) {
    try {
      const roles = await getUserRolesWithCache(supabase, user.id);

      if (pathname.startsWith("/admin")) {
        const hasAdminAccess =
          roles.includes("admin") || roles.includes("dept_head");

        if (!hasAdminAccess) {
          const fallback = roles.some((r) =>
            ["dept_staff", "ward_staff", "field_staff", "call_center"].includes(
              r
            )
          )
            ? "/staff/dashboard"
            : "/citizen/dashboard";

          return NextResponse.redirect(new URL(fallback, request.url));
        }
      }

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
      }
    } catch (error) {
      console.error("Middleware role check error:", error);
      if (pathname.startsWith("/admin") || pathname.startsWith("/staff")) {
        if (!isPublicInvitationPage) {
          return NextResponse.redirect(
            new URL("/citizen/dashboard", request.url)
          );
        }
      }
    }
  }

  return response;
}

async function getUserRolesWithCache(
  supabase: any,
  userId: string
): Promise<string[]> {
  const now = Date.now();
  const cached = ROLE_CACHE.get(userId);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.roles;
  }

  const roles = await getUserRoles(supabase, userId);
  ROLE_CACHE.set(userId, { roles, timestamp: now });
  return roles;
}

async function getUserRoles(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`role:roles(role_type, is_active)`)
      .eq("user_id", userId)
      .eq("role.is_active", true);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .map((ur: any) => ur.role?.role_type)
      .filter((rt: any) => rt && typeof rt === "string");
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};