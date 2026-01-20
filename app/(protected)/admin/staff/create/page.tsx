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

export default function CreateStaffPage() {
  const router = useRouter();
  const supabase = createClient();
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [deptResult, wardResult] = await Promise.all([
          supabase.from("departments").select("id, name").order("name"),
          supabase
            .from("wards")
            .select("id, ward_number, name")
            .order("ward_number"),
        ]);

        if (deptResult.data) setDepartments(deptResult.data);
        if (wardResult.data) setWards(wardResult.data);
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
      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Call the updated RPC function with creator ID
      const { data: result, error } = await supabase.rpc("rpc_register_staff", {
        p_email: data.email,
        p_full_name: data.full_name,
        p_staff_role: data.staff_role,
        p_phone: data.phone || null,
        p_department_id: data.department_id || null,
        p_ward_id: data.ward_id || null,
        p_is_supervisor: data.is_supervisor,
        p_specializations: data.specializations || null,
        p_employment_date: null,
        p_created_by: user?.id || null, // Add this line
      });

      if (error) throw error;

      // Handle the response
      if (result && !result.success) {
        // User doesn't exist yet
        if (result.requires_invitation) {
          toast.warning(
            `User ${data.email} needs to sign up first. They should create an account at /auth/signup, then you can assign their staff role.`,
            { duration: 8000 }
          );
        } else {
          throw new Error(result.message || "Registration failed");
        }
      } else {
        toast.success("Staff member registered successfully!");
        router.push("/admin/staff");
      }
    } catch (err: any) {
      console.error("Staff creation error:", err);
      toast.error(err.message || "Failed to create staff member");
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
