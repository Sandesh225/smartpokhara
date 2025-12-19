// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
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
            request: { headers: request.headers },
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

  // 2. Define Paths
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes("."); // Static files

  // 3. Extract Role from Metadata (Fast Check)
  // We rely on the DB trigger to keep this sync'd
  const userRole = user?.user_metadata?.primary_role || "citizen";

  // 4. Role-Based Redirect Logic
  const getDashboardPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "dept_head":
        return "/supervisor/dashboard";
      case "dept_staff":
      case "ward_staff":
      case "field_staff":
      case "call_center":
        return "/staff/dashboard";
      default:
        return "/citizen/dashboard";
    }
  };

  // SCENARIO A: Authenticated User trying to access Login/Register
  if (user && isAuthRoute) {
    return NextResponse.redirect(
      new URL(getDashboardPath(userRole), request.url)
    );
  }

  // SCENARIO B: Unauthenticated User trying to access Protected Routes
  if (!user && !isAuthRoute && !isPublicRoute) {
    // Determine if it's a protected path
    const isProtected =
      path.startsWith("/admin") ||
      path.startsWith("/supervisor") ||
      path.startsWith("/staff") ||
      path.startsWith("/citizen");

    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // SCENARIO C: Role Boundary Protection (Prevent Citizen from accessing Admin)
  if (user) {
    if (path.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (
      path.startsWith("/supervisor") &&
      !["admin", "dept_head"].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    // Staff area can be accessed by admin/supervisor/staff, but not citizens
    if (path.startsWith("/staff") && userRole === "citizen") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}
