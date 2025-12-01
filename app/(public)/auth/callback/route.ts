// app/(public)/auth/callback/route.ts - UPDATED
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  console.log("Auth callback called with:", { code, token, type, next });

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Handle OAuth flow (code present)
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback error:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_callback_failed`
        );
      }

      // If there's a 'next' parameter, use it
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Otherwise, fetch user and do role-based redirect
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        console.error("Error getting user after auth:", getUserError);
        return NextResponse.redirect(
          new URL("/citizen/dashboard", request.url)
        );
      }

      // Fetch roles for this user
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
        userRolesData?.map((ur: any) => ur.role?.role_type).filter(Boolean) ||
        [];

      // Determine dashboard based on role priority
      let dashboardPath = "/citizen/dashboard";

      if (roles.includes("admin") || roles.includes("dept_head")) {
        dashboardPath = "/admin/dashboard";
      } else if (
        roles.some((r: string) =>
          ["dept_staff", "ward_staff", "field_staff", "call_center"].includes(r)
        )
      ) {
        dashboardPath = "/staff/dashboard";
      }

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Handle password reset flow (token present)
    if (token && type === "recovery") {
      console.log("Processing password reset token");

      // Verify the recovery token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (verifyError) {
        console.error("Token verification failed:", verifyError);
        return NextResponse.redirect(
          `${requestUrl.origin}/forgot-password?error=invalid_token`
        );
      }

      // Success! Redirect to reset password page
      return NextResponse.redirect(
        new URL(
          `/reset-password?verified=true&token=${encodeURIComponent(token)}&type=${type}`,
          request.url
        )
      );
    }

    // If no code or token, redirect to login
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=missing_auth_params`
    );
  } catch (error) {
    console.error("Auth callback exception:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_callback_exception`
    );
  }
}
