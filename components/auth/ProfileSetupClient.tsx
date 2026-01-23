// ============================================================================
// FILE: components/auth/ProfileSetupClient.tsx
// ============================================================================
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Phone, Calendar, Home, 
  CheckCircle2, AlertCircle, Loader2, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string;
}

export function ProfileSetupClient() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    full_name_nepali: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    citizenship_number: "",
    ward_id: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    language_preference: "en"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWards();
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase.rpc("rpc_get_user_profile");
      
      if (error) throw error;
      
      if (data?.profile) {
        setFormData(prev => ({
          ...prev,
          full_name: data.profile.full_name || "",
          full_name_nepali: data.profile.full_name_nepali || "",
          date_of_birth: data.profile.date_of_birth || "",
          gender: data.profile.gender || "",
          citizenship_number: data.profile.citizenship_number || "",
          ward_id: data.profile.ward_id || "",
          address_line1: data.profile.address_line1 || "",
          address_line2: data.profile.address_line2 || "",
          landmark: data.profile.landmark || "",
          language_preference: data.profile.language_preference || "en"
        }));
      }

      if (data?.user?.phone) {
        setFormData(prev => ({ ...prev, phone: data.user.phone }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const fetchWards = async () => {
    try {
      const { data, error } = await supabase
        .from("wards")
        .select("id, ward_number, name, name_nepali")
        .eq("is_active", true)
        .order("ward_number");

      if (error) throw error;
      setWards(data || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Failed to load wards");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

  if (step === 1) {
  if (!formData.full_name || formData.full_name.trim().length < 3) {
    newErrors.full_name = "Name must be at least 3 characters";
  }

  if (formData.phone) {
    const nepaliPhonePattern = /^(\+977-?)?9[6-9]\d{8}$/;
    if (!nepaliPhonePattern.test(formData.phone)) {
      newErrors.phone = "Phone must be a valid Nepali number (e.g., 9851222001 or +977-9851222001)";
    }
  }

  if (!formData.gender) {
    newErrors.gender = "Please select gender";
  }
}



    if (step === 2) {
      if (!formData.ward_id) {
        newErrors.ward_id = "Please select your ward";
      }
      if (!formData.address_line1 || formData.address_line1.trim().length < 5) {
        newErrors.address_line1 = "Address required (min 5 characters)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    const toastId = toast.loading("Saving your profile...");

    try {
      const { data, error } = await supabase.rpc("rpc_update_user_profile", {
        p_full_name: formData.full_name,
        p_full_name_nepali: formData.full_name_nepali || null,
        p_phone: formData.phone || null,
        p_date_of_birth: formData.date_of_birth || null,
        p_gender: formData.gender || null,
        p_citizenship_number: formData.citizenship_number || null,
        p_ward_id: formData.ward_id || null,
        p_address_line1: formData.address_line1,
        p_address_line2: formData.address_line2 || null,
        p_landmark: formData.landmark || null,
        p_language_preference: formData.language_preference
      });

      if (error) throw error;

      toast.success("Profile completed successfully!", { id: toastId });
      
      const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
      const targetRoute = config?.dashboard_config?.default_route || "/citizen/dashboard";
      
      setTimeout(() => {
        router.push(targetRoute);
        router.refresh();
      }, 1000);

    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to save profile", { id: toastId });
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-brand to-accent-nature flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              SP
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary-brand-dark dark:text-foreground">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Help us serve you better with some basic information
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep >= 1 
                  ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/30' 
                  : 'bg-border text-muted-foreground'
              }`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">Personal Info</span>
            </div>
            <ChevronRight className="text-muted-foreground" />
            <div className={`flex items-center gap-2 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep >= 2 
                  ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/30' 
                  : 'bg-border text-muted-foreground'
              }`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Address</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="stone-card p-6 md:p-8 animate-in fade-in zoom-in duration-700">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary-brand-dark dark:text-foreground">
                <User className="w-6 h-6 text-primary-brand" />
                Personal Information
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full rounded-xl bg-background px-4 py-3.5 border-2 transition-all ${
                    errors.full_name 
                      ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10'
                  } outline-none text-foreground`}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name (Nepali)</label>
                <input
                  name="full_name_nepali"
                  type="text"
                  value={formData.full_name_nepali}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                  placeholder="जोन डो"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-xl bg-background pl-11 pr-4 py-3.5 border-2 transition-all text-foreground ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                          : 'border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10'
                      } outline-none`}
                      placeholder="9812345678"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full rounded-xl bg-background px-4 py-3.5 border-2 transition-all text-foreground ${
                      errors.gender 
                        ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10'
                    } outline-none`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background pl-11 pr-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Citizenship Number</label>
                  <input
                    name="citizenship_number"
                    type="text"
                    value={formData.citizenship_number}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background px-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-8 bg-primary-brand hover:bg-primary-brand-light text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Next: Address Details
              </button>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary-brand-dark dark:text-foreground">
                <MapPin className="w-6 h-6 text-primary-brand" />
                Address Information
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Ward *</label>
                <select
                  name="ward_id"
                  value={formData.ward_id}
                  onChange={handleChange}
                  className={`w-full rounded-xl bg-background px-4 py-3.5 border-2 transition-all text-foreground ${
                    errors.ward_id 
                      ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10'
                  } outline-none`}
                >
                  <option value="">Select Your Ward</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward_id && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ward_id}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Address Line 1 *</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <input
                    name="address_line1"
                    type="text"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className={`w-full rounded-xl bg-background pl-11 pr-4 py-3.5 border-2 transition-all text-foreground ${
                      errors.address_line1 
                        ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10'
                    } outline-none`}
                    placeholder="Street name, house number"
                  />
                </div>
                {errors.address_line1 && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address_line1}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Address Line 2 (Optional)</label>
                <input
                  name="address_line2"
                  type="text"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                  placeholder="Tole, Area"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Landmark (Optional)</label>
                <input
                  name="landmark"
                  type="text"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                  placeholder="Near temple, school, etc."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Preferred Language</label>
                <select
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 border-2 border-border focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 outline-none transition-all text-foreground"
                >
                  <option value="en">English</option>
                  <option value="ne">Nepali (नेपाली)</option>
                </select>
              </div>

              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-4">
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-border hover:bg-muted font-semibold py-4 rounded-xl transition-all text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary-brand hover:bg-primary-brand-light text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact support at{" "}
          <a href="mailto:support@smartcitypokhara.gov.np" className="text-primary-brand hover:underline">
            support@smartcitypokhara.gov.np
          </a>
        </p>
      </div>
    </div>
  );
}