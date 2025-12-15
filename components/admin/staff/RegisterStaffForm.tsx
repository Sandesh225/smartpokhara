"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
;
import { Label } from "@/components/ui/label";;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
;
import { Card, CardContent } from "@/components/ui/card";
;

import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  departments: any[];
  wards: any[];
}

export default function RegisterStaffForm({ departments, wards }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "dept_staff",
    departmentId: "",
    wardId: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // NOTE: This RPC must handle creating the auth user record internally,
      // or this logic should be adapted if you are using manual auth creation.
      const { data, error } = await supabase.rpc("rpc_register_staff", {
        p_email: formData.email,
        p_full_name: formData.fullName,
        p_phone: formData.phone || null,
        p_staff_role: formData.role,
        p_department_id: formData.departmentId || null,
        p_ward_id: formData.wardId || null,
        p_is_supervisor: formData.role === "dept_head",
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.message);
      }

      toast({
        title: "Staff Registered",
        description: `Successfully registered ${formData.fullName}. They can now log in.`,
      });

      router.push("/admin/staff");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register staff member.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="staff@pokhara.gov.np"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                required
                placeholder="Staff Name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+977..."
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => handleChange("role", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept_head">
                    Supervisor (Dept Head)
                  </SelectItem>
                  <SelectItem value="dept_staff">Department Staff</SelectItem>
                  <SelectItem value="ward_staff">Ward Staff</SelectItem>
                  <SelectItem value="field_staff">Field Staff</SelectItem>
                  <SelectItem value="call_center">Call Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Department/Ward Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            {["dept_head", "dept_staff", "field_staff"].includes(
              formData.role
            ) && (
              <div className="space-y-2">
                <Label>Department {formData.role === "dept_head" && "*"}</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(val) => handleChange("departmentId", val)}
                  required={formData.role === "dept_head"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role === "ward_staff" && (
              <div className="space-y-2">
                <Label>Ward *</Label>
                <Select
                  value={formData.wardId}
                  onValueChange={(val) => handleChange("wardId", val)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        Ward {w.ward_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Register Staff
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
