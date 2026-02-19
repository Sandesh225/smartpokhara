// ═══════════════════════════════════════════════════════════
// app/admin/staff/create/page.tsx - CREATE STAFF PAGE
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StaffForm } from "../_components/StaffForm";
import { staffApi, useStaffMutations } from "@/features/staff";

export default function CreateStaffPage() {
  const router = useRouter();
  const supabase = createClient();
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { createStaff } = useStaffMutations();

  useEffect(() => {
    async function loadData() {
      try {
        const [deptData, wardData] = await Promise.all([
          staffApi.getDepartments(supabase),
          staffApi.getWards(supabase)
        ]);

        if (deptData) setDepartments(deptData);
        if (wardData) setWards(wardData);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
        await createStaff.mutateAsync({
            email: data.email,
            full_name: data.full_name,
            staff_role: data.staff_role,
            phone: data.phone || null,
            department_id: data.department_id || null,
            ward_id: data.ward_id || null,
            is_supervisor: data.is_supervisor,
            specializations: data.specializations || null,
        });
        
        // Success handling is in mutation hook, but we need redirect
        router.push("/admin/staff");
    } catch (err: any) {
        // Error handled in hook
        console.error("Submission error", err);
    }
  };
  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-8">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild size="sm" className="mb-4 md:mb-6">
        <Link href="/admin/staff">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff Directory
        </Link>
      </Button>

      {/* FORM CARD */}
      <Card className="stone-card">
        <CardHeader className="p-4 md:p-6 border-b border-border bg-muted/30">
          <CardTitle className="text-lg md:text-xl font-black">
            Register New Staff Member
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new staff member to the municipal system
          </p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading form...</p>
            </div>
          ) : (
            <StaffForm
              departments={departments}
              wards={wards}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
