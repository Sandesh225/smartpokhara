// app/(auth)/setup-profile/page.tsx
import { ProfileSetupClient } from "@/components/auth/ProfileSetupClient";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function SetupProfilePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  let targetRoute: string | null = null;
  // Check if profile is already complete to prevent re-filling
  try {
    const { data: profileCheck } = await supabase.rpc(
      "rpc_is_profile_complete"
    );
    if (profileCheck?.is_complete) {
      const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
      targetRoute = config?.dashboard_config?.default_route || "/citizen/dashboard";
    }
  } catch (error: any) {
    // Re-throw Next.js redirect errors — they are NOT real errors
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Profile check error:", error);
  }

  if (targetRoute) {
    // Only redirect if targetRoute is NOT the current page to avoid infinite loops
    // In this specific page, targetRoute should ideally be a dashboard, not /setup-profile
    if (targetRoute !== "/setup-profile") {
      console.log(`[SetupProfilePage] Redirecting to ${targetRoute} as profile is complete.`);
      redirect(targetRoute);
    } else {
      console.warn("[SetupProfilePage] targetRoute set to /setup-profile while already on /setup-profile. Loop prevented.");
    }
  }

  return <ProfileSetupClient />;
}
