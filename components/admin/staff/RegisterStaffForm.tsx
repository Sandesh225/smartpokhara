// ============================================================================
// FILE: app/(protected)/admin/staff/register/page.tsx
// Complete Staff Registration Page
// ============================================================================

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { RegisterStaffForm } from "@/components/admin/staff/RegisterStaffForm";

export const metadata = {
  title: "Register Staff | Admin Portal",
  description: "Register new staff members and assign roles",
};

export default async function RegisterStaffPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Register Staff Member
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create accounts and assign roles for new staff members
          </p>
        </div>

        <RegisterStaffForm />
      </div>
    </div>
  );
}

// ============================================================================
// FILE: components/admin/staff/RegisterStaffForm.tsx
// Main Staff Registration Form Component
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  MapPin,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service";

interface Department {
  id: string;
  name: string;
  name_nepali: string | null;
  is_active: boolean;
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string | null;
}

interface RoleOption {
  id: string;
  name: string;
  role_type: string;
  description: string;
  permissions: any;
}

type StaffRoleType =
  | "ward_staff"
  | "dept_staff"
  | "field_staff"
  | "dept_head"
  | "call_center"
  | "admin";

interface FormData {
  // User Details
  email: string;
  phone: string;
  full_name: string;
  full_name_nepali: string;
  
  // Role Assignment
  role_type: StaffRoleType;
  department_id: string;
  ward_id: string;
  is_supervisor: boolean;
  
  // Optional: Also give dept_staff role for dept_heads
  also_dept_staff: boolean;
  
  // Password
  temporary_password: string;
  confirm_password: string;
}

export function RegisterStaffForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [step, setStep] = useState<"form" | "success">("form");
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    full_name: "",
    full_name_nepali: "",
    role_type: "dept_staff",
    department_id: "",
    ward_id: "",
    is_supervisor: false,
    also_dept_staff: false,
    temporary_password: "",
    confirm_password: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  // Load reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    setLoadingData(true);
    try {
      const [rolesRes, deptsRes, wardsRes] = await Promise.all([
        supabase
          .from("roles")
          .select("*")
          .in("role_type", [
            "admin",
            "dept_head",
            "dept_staff",
            "ward_staff",
            "field_staff",
            "call_center",
          ])
          .eq("is_active", true)
          .order("role_type"),
        supabase
          .from("departments")
          .select("id, name, name_nepali, is_active")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("wards")
          .select("id, ward_number, name, name_nepali")
          .order("ward_number"),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (deptsRes.data) setDepartments(deptsRes.data);
      if (wardsRes.data) setWards(wardsRes.data);
    } catch (error) {
      console.error("Error loading reference data:", error);
      showErrorToast("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({
      ...prev,
      temporary_password: password,
      confirm_password: password,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation (optional but format check if provided)
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    // Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    // Role-specific validation
    if (!formData.role_type) {
      newErrors.role_type = "Role type is required";
    }

    // Department validation for dept_staff, dept_head, field_staff
    if (
      ["dept_staff", "dept_head", "field_staff"].includes(formData.role_type) &&
      !formData.department_id
    ) {
      newErrors.department_id = "Department is required for this role";
    }

    // Ward validation for ward_staff
    if (formData.role_type === "ward_staff" && !formData.ward_id) {
      newErrors.ward_id = "Ward is required for ward staff";
    }

    // Password validation
    if (!formData.temporary_password) {
      newErrors.temporary_password = "Password is required";
    } else if (formData.temporary_password.length < 8) {
      newErrors.temporary_password = "Password must be at least 8 characters";
    }

    if (formData.temporary_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      // Call the staff registration RPC
      const { data, error } = await supabase.rpc("register_staff_member", {
        p_email: formData.email.trim(),
        p_phone: formData.phone.trim() || null,
        p_full_name: formData.full_name.trim(),
        p_full_name_nepali: formData.full_name_nepali.trim() || null,
        p_temporary_password: formData.temporary_password,
        p_role_type: formData.role_type,
        p_department_id: formData.department_id || null,
        p_ward_id: formData.ward_id || null,
        p_is_supervisor: formData.is_supervisor,
        p_also_dept_staff: formData.also_dept_staff,
      });

      if (error) throw error;

      setCreatedUserId(data.user_id);
      setStep("success");
      showSuccessToast("Staff member registered successfully!");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message?.includes("User already exists")) {
        showErrorToast("A user with this email already exists");
      } else {
        showErrorToast(error.message || "Failed to register staff member");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      phone: "",
      full_name: "",
      full_name_nepali: "",
      role_type: "dept_staff",
      department_id: "",
      ward_id: "",
      is_supervisor: false,
      also_dept_staff: false,
      temporary_password: "",
      confirm_password: "",
    });
    setErrors({});
    setStep("form");
    setCreatedUserId(null);
  };

  // Success screen
  if (step === "success") {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Staff Member Registered Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {formData.full_name} has been registered as{" "}
              <strong>{formData.role_type.replace(/_/g, " ")}</strong>
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Login Credentials
                </p>
                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                  Email: {formData.email}
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  Password: {formData.temporary_password}
                </p>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ User must change password on first login
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => router.push("/admin/staff")}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Staff List
              </Button>
              <Button onClick={resetForm} className="flex-1">
                Register Another Staff
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  // Main form
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.full_name
                      ? "border-red-300"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name (Nepali)
                </label>
                <input
                  type="text"
                  name="full_name_nepali"
                  value={formData.full_name_nepali}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="जोन डो"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      errors.email
                        ? "border-red-300"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                    placeholder="john@pokhara.gov.np"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      errors.phone
                        ? "border-red-300"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                    placeholder="+977-9841234567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Staff Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.role_type
                    ? "border-red-300"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
              >
                <option value="">Select role type...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.role_type}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_type && (
                <p className="mt-1 text-sm text-red-600">{errors.role_type}</p>
              )}
              {formData.role_type && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {
                    roles.find((r) => r.role_type === formData.role_type)
                      ?.description
                  }
                </p>
              )}
            </div>

            {/* Department Selection (for dept_staff, dept_head, field_staff) */}
            {["dept_staff", "dept_head", "field_staff"].includes(
              formData.role_type
            ) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      errors.department_id
                        ? "border-red-300"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                  >
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                        {dept.name_nepali && ` (${dept.name_nepali})`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department_id}
                  </p>
                )}
              </div>
            )}

            {/* Ward Selection (for ward_staff or optional for field_staff) */}
            {(formData.role_type === "ward_staff" ||
              formData.role_type === "field_staff") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ward{" "}
                  {formData.role_type === "ward_staff" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    name="ward_id"
                    value={formData.ward_id}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      errors.ward_id
                        ? "border-red-300"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                  >
                    <option value="">Select ward...</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}></option>