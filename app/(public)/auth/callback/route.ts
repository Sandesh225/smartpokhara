// app/(public)/auth/callback/route.ts
// ✅ COMPLETE FIXED VERSION - Proper role-based redirect after auth

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  a;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If there's a 'next' parameter, use it
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Otherwise, fetch user roles and redirect to appropriate dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const { data: userRolesData, error: rolesError } = await supabase
            .from("user_roles")
            .select("role:roles(role_type, is_active)")
            .eq("user_id", user.id)
            .eq("role.is_active", true);

          if (rolesError) {
            console.error("Error fetching roles:", rolesError);
            // Default to citizen dashboard on error
            return NextResponse.redirect(
              new URL("/citizen/dashboard", request.url)
            );
          }

          const roles =
            userRolesData
              ?.map((ur: any) => ur.role?.role_type)
              .filter(Boolean) || [];

          // Determine dashboard based on role priority
          let dashboardPath = "/citizen/dashboard";

          if (roles.includes("admin") || roles.includes("dept_head")) {
            dashboardPath = "/admin/dashboard";
          } else if (
            roles.some((r: string) =>
              [
                "dept_staff",
                "ward_staff",
                "field_staff",
                "call_center",
              ].includes(r)
            )
          ) {
            dashboardPath = "/staff/dashboard";
          }

          return NextResponse.redirect(new URL(dashboardPath, request.url));
        } catch (err) {
          console.error("Exception in auth callback:", err);
          return NextResponse.redirect(
            new URL("/citizen/dashboard", request.url)
          );
        }
      }
    }
  }

  // Redirect to login with error if code exchange failed
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_error", request.url)
  );
}
