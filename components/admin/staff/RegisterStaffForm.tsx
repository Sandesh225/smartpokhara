"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/providers/ToastProvider";
import { Loader2 } from "lucide-react";

const STAFF_ROLES = [
  { value: "dept_staff", label: "Department Staff" },
  { value: "ward_staff", label: "Ward Staff" },
  { value: "field_staff", label: "Field Staff" },
  { value: "call_center", label: "Call Center Agent" },
  { value: "dept_head", label: "Department Head (Supervisor)" },
];

interface FormData {
  email: string;
  full_name: string;
  staff_role: string;
  phone: string;
  department_id: string;
  ward_id: string;
  is_supervisor: boolean;
}

export default function RegisterStaffForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [existingUserCheck, setExistingUserCheck] = useState<boolean | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    email: "",
    full_name: "",
    staff_role: "",
    phone: "",
    department_id: "",
    ward_id: "",
    is_supervisor: false,
  });

  // Check if user exists when email changes
  const checkUserExists = async (email: string) => {
    if (!email || !email.includes("@")) {
      setExistingUserCheck(null);
      return;
    }

    setChecking(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email)
        .single();

      if (error || !data) {
        setExistingUserCheck(false);
      } else {
        setExistingUserCheck(true);
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      setExistingUserCheck(false);
      toast("Failed to check user. Please try again.", "error");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        void checkUserExists(formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.staff_role) {
      toast("Please select a staff role", "error");
      return;
    }

    if (!formData.email || !formData.full_name) {
      toast("Email and full name are required", "error");
      return;
    }

    if (existingUserCheck === false) {
      toast(
        "User does not exist. Ask them to sign up at /auth/signup first.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      console.log("Calling rpc_register_staff with:", {
        p_email: formData.email,
        p_full_name: formData.full_name,
        p_staff_role: formData.staff_role,
        p_phone: formData.phone || null,
        p_department_id: formData.department_id || null,
        p_ward_id: formData.ward_id || null,
        p_is_supervisor: formData.is_supervisor,
        p_specializations: null,
        p_employment_date: null,
      });

      const { data, error } = await supabase.rpc("rpc_register_staff", {
        p_email: formData.email,
        p_full_name: formData.full_name,
        p_staff_role: formData.staff_role,
        p_phone: formData.phone || null,
        p_department_id: formData.department_id || null,
        p_ward_id: formData.ward_id || null,
        p_is_supervisor: formData.is_supervisor,
        p_specializations: null,
        p_employment_date: null,
      });

      if (error) {
        console.error("RPC Error:", error);
        toast(error.message || "Failed to register staff", "error");
        return;
      }

      console.log("RPC Response:", data);

      if (data?.success) {
        toast(
          data.message || "Staff member registered successfully!",
          "success"
        );

        setFormData({
          email: "",
          full_name: "",
          staff_role: "",
          phone: "",
          department_id: "",
          ward_id: "",
          is_supervisor: false,
        });
        setExistingUserCheck(null);

        setTimeout(() => {
          router.refresh();
          router.push("/admin/staff");
        }, 1500);
      } else if (data?.requires_invitation) {
        toast(
          "User doesn't exist. Please have them sign up first at /auth/signup.",
          "warning"
        );
      } else {
        toast("Unexpected response from server", "error");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast(error?.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions (simple box instead of Alert) */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">How to Register Staff</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Enter the staff member&apos;s email address.</li>
          <li>
            If they don&apos;t have an account, have them sign up at{" "}
            <strong>/auth/signup</strong> first.
          </li>
          <li>
            Once they have an account, return here to assign their staff role.
          </li>
        </ol>
      </div>

      {/* Small inline status for user existence */}
      {checking && (
        <p className="text-sm text-gray-500">Checking if user exists...</p>
      )}

      {!checking && existingUserCheck === false && formData.email && (
        <p className="text-sm text-red-600">
          No user found with <strong>{formData.email}</strong>. Ask them to sign
          up at <strong>/auth/signup</strong> first.
        </p>
      )}

      {!checking && existingUserCheck === true && formData.email && (
        <p className="text-sm text-green-600">
          ✓ User with email <strong>{formData.email}</strong> exists. You can
          now assign a staff role.
        </p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              placeholder="staff@pokhara.gov.np"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_role">
              Staff Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.staff_role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, staff_role: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+977-9800000000"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_supervisor"
            checked={formData.is_supervisor}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_supervisor: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            disabled={loading}
          />
          <Label htmlFor="is_supervisor" className="cursor-pointer">
            Is Supervisor / Team Lead?
          </Label>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || existingUserCheck === false || checking}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Staff Member"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/staff")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        {!checking && existingUserCheck === false && formData.email && (
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded border">
            <strong>Next Steps:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>
                Direct <strong>{formData.email}</strong> to sign up at{" "}
                <code className="bg-gray-200 px-2 py-1 rounded">
                  /auth/signup
                </code>
              </li>
              <li>Once they complete signup, return to this page.</li>
              <li>Enter their email again and assign the staff role.</li>
            </ol>
          </div>
        )}
      </form>
    </div>
  );
}
