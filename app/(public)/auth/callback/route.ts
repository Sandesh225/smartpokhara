// app/(public)/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  console.log("Auth callback:", { code, type, next, error, errorDescription });

  // Handle errors from Supabase
  if (error) {
    console.error(
      "Auth callback error from Supabase:",
      error,
      errorDescription
    );

    if (error === "access_denied" && errorDescription?.includes("expired")) {
      return NextResponse.redirect(
        `${requestUrl.origin}/forgot-password?error=link_expired`
      );
    }

    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
  }

  try {
    const supabase = await createClient();

    // PASSWORD RESET FLOW - Supabase automatically creates session
    if (type === "recovery") {
      console.log("🔐 Recovery flow detected");

      // Verify session exists
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No session after recovery link:", sessionError);
        return NextResponse.redirect(
          `${requestUrl.origin}/forgot-password?error=link_expired`
        );
      }

      console.log("✅ Recovery session verified");

      // Set a special cookie to mark this as a password reset flow
      const cookieStore = await cookies();
      cookieStore.set("password-reset-flow", "true", {
        path: "/",
        maxAge: 600, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return NextResponse.redirect(new URL("/reset-password", request.url));
    }

    // REGULAR LOGIN/SIGNUP FLOW - Use code exchange
    if (!code) {
      console.error("No code provided for regular auth flow");
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=missing_code`
      );
    }

    console.log("📧 Regular auth flow - exchanging code");

    // Exchange code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange error:", exchangeError);

      if (exchangeError.message.includes("expired")) {
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=link_expired`
        );
      }

      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_failed`
      );
    }

    // Redirect based on next parameter or user roles
    if (next) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Use standardized dashboard config for redirection
    const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
    
    let dashboardPath = config?.dashboard_config?.default_route || "/citizen/dashboard";

    console.log("✅ Auth successful, redirecting to:", dashboardPath);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  } catch (error) {
    console.error("Auth callback exception:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=server_error`
    );
  }
}
