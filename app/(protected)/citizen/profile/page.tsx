// app/(protected)/citizen/profile/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/citizen/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, ward:wards(id, ward_number, name)")
    .eq("user_id", user.id)
    .single();

  const { data: wards } = await supabase
    .from("wards")
    .select("id, ward_number, name")
    .eq("is_active", true)
    .order("ward_number");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileForm profile={profile} wards={wards || []} />
    </div>
  );
}
