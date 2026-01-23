// ============================================================================
// FILE: app/(auth)/setup-profile/page.tsx
// ============================================================================
import { ProfileSetupClient } from "@/components/auth/ProfileSetupClient";
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/login");
  }

  // Check if profile is already complete
  try {
    const { data: profileCheck } = await supabase.rpc("rpc_is_profile_complete");

    if (profileCheck?.is_complete) {
      const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
      const targetRoute = config?.dashboard_config?.default_route || "/citizen/dashboard";
      redirect(targetRoute);
    }
  } catch (error) {
    console.error("Profile check error:", error);
  }

  return <ProfileSetupClient />;
}