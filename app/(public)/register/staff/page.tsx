// app/(public)/register/staff/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StaffRegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  role_type: string;
  department_id: string;
  ward_id: string;
  employee_id: string;
}

export default function StaffRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffRegistrationForm>({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    role_type: "",
    department_id: "",
    ward_id: "",
    employee_id: "",
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Load departments, wards, and roles on component mount
  useState(() => {
    loadReferenceData();
  });

  const loadReferenceData = async () => {
    const supabase = createClient();
    
    try {
      const [deptResult, wardsResult, rolesResult] = await Promise.all([
        supabase.from("departments").select("*").eq("is_active", true).order("name"),
        supabase.from("wards").select("*").eq("is_active", true).order("ward_number"),
        supabase.from("roles").select("*").eq("is_active", true).neq("role_type", "citizen").neq("role_type", "tourist").order("role_type")
      ]);

      if (deptResult.data) setDepartments(deptResult.data);
      if (wardsResult.data) setWards(wardsResult.data);
      if (rolesResult.data) setRoles(rolesResult.data);
    } catch (error) {
      console.error("Error loading reference data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            user_type: "staff",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Step 2: Wait a moment for the auth trigger to create the user record
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Get the role ID for the selected role type
      const selectedRole = roles.find(r => r.role_type === formData.role_type);
      if (!selectedRole) {
        throw new Error("Selected role not found");
      }

      // Step 4: Assign staff role using service role (via edge function)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role_id: selectedRole.id,
          assigned_by: authData.user.id, // Self-assigned for now
        });

      if (roleError) throw roleError;

      // Step 5: Update profile with additional staff information
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("user_id", authData.user.id);

      if (profileError) throw profileError;

      // Step 6: Department assignment for department staff
      if (["dept_staff", "dept_head"].includes(formData.role_type) && formData.department_id) {
        const { error: deptError } = await supabase
          .from("department_staff")
          .insert({
            user_id: authData.user.id,
            department_id: formData.department_id,
          });

        if (deptError) throw deptError;
      }

      // Step 7: Ward assignment for ward staff
      if (formData.role_type === "ward_staff" && formData.ward_id) {
        const { error: wardError } = await supabase
          .from("user_profiles")
          .update({ ward_id: formData.ward_id })
          .eq("user_id", authData.user.id);

        if (wardError) throw wardError;
      }

      // Step 8: Store employee ID in user metadata
      if (formData.employee_id) {
        const { error: metadataError } = await supabase
          .from("users")
          .update({ 
            phone: formData.phone,
            metadata: { employee_id: formData.employee_id }
          })
          .eq("id", authData.user.id);

        if (metadataError) throw metadataError;
      }

      // Success - redirect to login with success message
      router.push("/login?message=staff_registration_success&email=" + encodeURIComponent(formData.email));

    } catch (error: any) {
      console.error("Staff registration error:", error);
      setError(error.message || "Failed to create staff account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showDepartmentField = ["dept_staff", "dept_head"].includes(formData.role_type);
  const showWardField = formData.role_type === "ward_staff";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Registration</h1>
            <p className="mt-2 text-gray-600">
              Register as municipal staff member
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Personal Information */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>

              {/* Staff Role Information */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Role & Assignment</h3>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="role_type" className="block text-sm font-medium text-gray-700">
                  Staff Role *
                </label>
                <select
                  id="role_type"
                  name="role_type"
                  required
                  value={formData.role_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.role_type}>
                      {role.name} ({role.role_type})
                    </option>
                  ))}
                </select>
              </div>

              {showDepartmentField && (
                <div className="sm:col-span-2">
                  <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                    Department *
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    required={showDepartmentField}
                    value={formData.department_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showWardField && (
                <div className="sm:col-span-2">
                  <label htmlFor="ward_id" className="block text-sm font-medium text-gray-700">
                    Ward Assignment *
                  </label>
                  <select
                    id="ward_id"
                    name="ward_id"
                    required={showWardField}
                    value={formData.ward_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select ward</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        Ward {ward.ward_number} - {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Security Information */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Register as Staff"}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Register as Citizen instead
              </Link>
            </div>
          </form>
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Staff Roles</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Department Head</h4>
              <p className="text-sm text-gray-600 mt-1">Manage department staff and oversee departmental complaints</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Department Staff</h4>
              <p className="text-sm text-gray-600 mt-1">Process and resolve department-specific complaints</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Ward Staff</h4>
              <p className="text-sm text-gray-600 mt-1">Handle ward-level complaints and local coordination</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Field Staff</h4>
              <p className="text-sm text-gray-600 mt-1">Carry out field work and on-ground task completion</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
              <h4 className="font-medium text-gray-900">Helpdesk/Call Center</h4>
              <p className="text-sm text-gray-600 mt-1">Register complaints and provide citizen support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}