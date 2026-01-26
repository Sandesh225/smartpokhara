// components/auth/ProfileSetupClient.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Phone, Calendar, Home, 
  AlertCircle, Loader2, ChevronRight, Check, Languages
} from "lucide-react";
import { toast } from "sonner";

export function ProfileSetupClient() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "", full_name_nepali: "", phone: "",
    date_of_birth: "", gender: "", citizenship_number: "",
    ward_id: "", address_line1: "", address_line2: "",
    landmark: "", language_preference: "en"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWards();
    loadExistingProfile();
  }, []);

  const fetchWards = async () => {
    const { data } = await supabase.from("wards").select("*").eq("is_active", true).order("ward_number");
    setWards(data || []);
  };

  const loadExistingProfile = async () => {
    const { data } = await supabase.rpc("rpc_get_user_profile");
    if (data?.profile) setFormData(prev => ({ ...prev, ...data.profile }));
    if (data?.user?.phone) setFormData(prev => ({ ...prev, phone: data.user.phone }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    if (step === 1) {
      if (!formData.full_name) newErrors.full_name = "Official name is required";
      if (!formData.gender) newErrors.gender = "Selection required";
    } else {
      if (!formData.ward_id) newErrors.ward_id = "Ward selection is mandatory";
      if (!formData.address_line1) newErrors.address_line1 = "Primary address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setLoading(true);
    const toastId = toast.loading("Finalizing your official profile...");

    try {
      const { error } = await supabase.rpc("rpc_update_user_profile", {
        p_full_name: formData.full_name,
        p_full_name_nepali: formData.full_name_nepali,
        p_phone: formData.phone,
        p_date_of_birth: formData.date_of_birth,
        p_gender: formData.gender,
        p_citizenship_number: formData.citizenship_number,
        p_ward_id: formData.ward_id,
        p_address_line1: formData.address_line1,
        p_address_line2: formData.address_line2,
        p_landmark: formData.landmark,
        p_language_preference: formData.language_preference
      });

      if (error) throw error;
      toast.success("Profile Activated", { id: toastId });
      router.push("/citizen/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex flex-col items-center">
      {/* Brand Identity */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-black shadow-xl mb-4">
          SP
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
          Citizen Registration
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Establish your digital identity for Smart Pokhara Metropolitan services.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Progress Stepper */}
        <div className="mb-8 px-4 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />
          {[1, 2].map((step) => (
            <div key={step} className="flex flex-col items-center gap-2 bg-background px-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep >= step ? "bg-primary border-primary text-white shadow-lg" : "bg-background border-border text-muted-foreground"
              }`}>
                {currentStep > step ? <Check size={18} /> : step}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}>
                {step === 1 ? "Identity" : "Location"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="card-gov overflow-hidden">
          <div className="card-gov-header flex items-center gap-2">
            {currentStep === 1 ? <User size={18} className="text-primary" /> : <MapPin size={18} className="text-secondary" />}
            <span>{currentStep === 1 ? "Personal Details" : "Residency Information"}</span>
          </div>

          <div className="card-gov-body space-y-6">
            {currentStep === 1 ? (
              <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name (English) *</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} className="input-gov" placeholder="As per citizenship" />
                    {errors.full_name && <p className="text-xs text-destructive font-medium">{errors.full_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">पूरा नाम (नेपाली)</label>
                    <input name="full_name_nepali" value={formData.full_name_nepali} onChange={handleChange} className="input-gov font-medium" placeholder="नागरिकता अनुसार" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <input name="phone" value={formData.phone} onChange={handleChange} className="input-gov pl-10" placeholder="98XXXXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-gov">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Date of Birth</label>
                    <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="input-gov" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Citizenship No.</label>
                    <input name="citizenship_number" value={formData.citizenship_number} onChange={handleChange} className="input-gov" placeholder="XX-XX-XX-XXXXX" />
                  </div>
                </div>
                
                <button onClick={() => validateStep(1) && setCurrentStep(2)} className="btn-gov btn-gov-primary w-full h-12">
                  Continue to Address <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            ) : (
              <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Ward Office *</label>
                  <select name="ward_id" value={formData.ward_id} onChange={handleChange} className="input-gov">
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>Ward {w.ward_number} — {w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Primary Address *</label>
                  <input name="address_line1" value={formData.address_line1} onChange={handleChange} className="input-gov" placeholder="Tole, House Name/Number" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Landmark</label>
                    <input name="landmark" value={formData.landmark} onChange={handleChange} className="input-gov" placeholder="Near Temple, School, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Languages size={14} /> Preference
                    </label>
                    <select name="language_preference" value={formData.language_preference} onChange={handleChange} className="input-gov">
                      <option value="en">English</option>
                      <option value="ne">नेपाली</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setCurrentStep(1)} className="btn-gov btn-gov-outline flex-1">Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-gov btn-gov-secondary flex-[2] shadow-lg">
                    {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground px-6">
          Information provided here is protected under the Pokhara Metropolitan Privacy Act. 
          Ensure all data matches your government-issued identification.
        </p>
      </div>
    </div>
  );
}