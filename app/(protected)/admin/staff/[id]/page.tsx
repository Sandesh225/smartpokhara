import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import StaffProfileForm from "@/components/admin/staff/StaffProfileForm";
import { Card, CardContent } from "@/ui/card";

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUserWithRoles();

  if (!currentUser || !isAdmin(currentUser)) redirect("/login");

  const supabase = await createClient();

  // Fetch Staff Profile + User Info
  const { data: staff, error } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      user:users(id, email, user_profiles(full_name))
    `)
    .eq("user_id", id)
    .single();

  const { data: departments } = await supabase.from("departments").select("*").eq("is_active", true);
  const { data: wards } = await supabase.from("wards").select("*").eq("is_active", true).order("ward_number");

  if (error || !staff) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Staff Profile Not Found</h2>
        <p className="text-gray-500">The user may exist but does not have a staff profile configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Staff Assignment" 
        description={`Configure department and role for ${staff.user?.user_profiles?.full_name || staff.user?.email}`} 
      />
      
      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-6">
             <StaffProfileForm 
               staff={staff} 
               departments={departments || []} 
               wards={wards || []} 
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}