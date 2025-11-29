// components/staff/HelpdeskComplaintForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HelpdeskComplaintFormProps {
  onSuccess?: (trackingCode: string) => void;
}

export function HelpdeskComplaintForm({ onSuccess }: HelpdeskComplaintFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Citizen Info
    citizen_phone: "",
    citizen_name: "",
    citizen_email: "",
    
    // Complaint Details
    category_id: "",
    subcategory_id: "",
    ward_id: "",
    title: "",
    description: "",
    address_text: "",
    landmark: "",
    
    // Optional citizen creation
    create_citizen_account: false,
  });

  // Load categories and wards on mount
  useState(() => {
    loadInitialData();
  });

  const loadInitialData = async () => {
    const supabase = createClient();
    
    try {
      const [categoriesRes, wardsRes] = await Promise.all([
        supabase.from("complaint_categories").select("id, name").eq("is_active", true),
        supabase.from("wards").select("id, ward_number, name").eq("is_active", true)
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (wardsRes.data) setWards(wardsRes.data);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("complaint_subcategories")
        .select("id, name")
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    
    try {
      let citizenUserId: string | undefined;

      // Step 1: Find or create citizen
      if (formData.citizen_phone) {
        // Check if user exists with this phone
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("phone", formData.citizen_phone)
          .single();

        if (existingUser) {
          citizenUserId = existingUser.id;
        } else if (formData.create_citizen_account) {
          // Create new citizen account
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.citizen_email || `${formData.citizen_phone}@pokhara.gov.np`,
            password: Math.random().toString(36).slice(-8), // Random password
            phone: formData.citizen_phone,
            options: {
              data: {
                full_name: formData.citizen_name,
                phone: formData.citizen_phone,
              }
            }
          });

          if (authError) throw authError;
          if (authData.user) {
            citizenUserId = authData.user.id;
            
            // Create user profile
            await supabase
              .from("user_profiles")
              .insert({
                user_id: authData.user.id,
                full_name: formData.citizen_name,
                phone: formData.citizen_phone,
              });
          }
        }
      }

      // Step 2: Create complaint
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert({
          citizen_id: citizenUserId,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          ward_id: formData.ward_id || null,
          address_text: formData.address_text,
          landmark: formData.landmark,
          source: "call_center",
          status: "submitted",
          priority: "medium",
        })
        .select("tracking_code")
        .single();

      if (complaintError) throw complaintError;

      // Success
      if (onSuccess) {
        onSuccess(complaint.tracking_code);
      } else {
        alert(`Complaint created successfully! Tracking code: ${complaint.tracking_code}`);
        router.push("/staff/helpdesk");
      }

      // Reset form
      setFormData({
        citizen_phone: "",
        citizen_name: "",
        citizen_email: "",
        category_id: "",
        subcategory_id: "",
        ward_id: "",
        title: "",
        description: "",
        address_text: "",
        landmark: "",
        create_citizen_account: false,
      });
      setStep(1);

    } catch (error) {
      console.error("Error creating complaint:", error);
      alert("Error creating complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Citizen Information */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Citizen Information</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="citizen_phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="citizen_phone"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.citizen_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, citizen_phone: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="citizen_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="citizen_name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.citizen_name}
                onChange={(e) => setFormData(prev => ({ ...prev, citizen_name: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="create_citizen_account"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.create_citizen_account}
              onChange={(e) => setFormData(prev => ({ ...prev, create_citizen_account: e.target.checked }))}
            />
            <label htmlFor="create_citizen_account" className="ml-2 block text-sm text-gray-700">
              Create citizen portal account for tracking
            </label>
          </div>

          {formData.create_citizen_account && (
            <div>
              <label htmlFor="citizen_email" className="block text-sm font-medium text-gray-700">
                Email Address (for account)
              </label>
              <input
                type="email"
                id="citizen_email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.citizen_email}
                onChange={(e) => setFormData(prev => ({ ...prev, citizen_email: e.target.value }))}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next: Complaint Details
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Complaint Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Complaint Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category_id"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.category_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category_id: e.target.value, subcategory_id: "" }));
                  loadSubcategories(e.target.value);
                }}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <select
                id="subcategory_id"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.subcategory_id}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory_id: e.target.value }))}
                disabled={!formData.category_id}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ward_id" className="block text-sm font-medium text-gray-700">
                Ward
              </label>
              <select
                id="ward_id"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.ward_id}
                onChange={(e) => setFormData(prev => ({ ...prev, ward_id: e.target.value }))}
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.ward_number} - {ward.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="address_text" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address_text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.address_text}
                onChange={(e) => setFormData(prev => ({ ...prev, address_text: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.landmark}
              onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Complaint"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}