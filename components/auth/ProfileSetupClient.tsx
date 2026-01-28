"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Phone, FileText, 
  Loader2, ChevronRight, Check, Languages,
  Shield, Building2, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface FormData {
  full_name: string;
  full_name_nepali: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  citizenship_number: string;
  ward_id: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  language_preference: string;
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
}

export function ProfileSetupClient() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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

  const fetchWards = async () => {
    const { data } = await supabase
      .from("wards")
      .select("*")
      .eq("is_active", true)
      .order("ward_number");
    setWards(data || []);
  };

  const loadExistingProfile = async () => {
    const { data } = await supabase.rpc("rpc_get_user_profile");
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
      setFormData(prev => ({ ...prev, phone: data.user.phone || "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.full_name.trim()) {
        newErrors.full_name = "Full name is required";
      }
      if (!formData.gender) {
        newErrors.gender = "Gender selection is required";
      }
    } else if (step === 2) {
      if (!formData.ward_id) {
        newErrors.ward_id = "Ward selection is required";
      }
      if (!formData.address_line1.trim()) {
        newErrors.address_line1 = "Primary address is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    setLoading(true);
    const toastId = toast.loading("Finalizing your profile...");

    try {
      const { error } = await supabase.rpc("rpc_update_user_profile", {
        p_full_name: formData.full_name,
        p_full_name_nepali: formData.full_name_nepali,
        p_phone: formData.phone,
        p_date_of_birth: formData.date_of_birth || null,
        p_gender: formData.gender,
        p_citizenship_number: formData.citizenship_number,
        p_ward_id: formData.ward_id,
        p_address_line1: formData.address_line1,
        p_address_line2: formData.address_line2,
        p_landmark: formData.landmark,
        p_language_preference: formData.language_preference
      });

      if (error) throw error;
      
      toast.success("Profile successfully activated!", { id: toastId });
      router.push("/citizen/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Identity", icon: User },
    { number: 2, label: "Location", icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      
      <div className="relative z-10 container-gov py-8 sm:py-12 lg:py-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-primary via-primary-brand to-secondary shadow-2xl mb-6 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary animate-pulse opacity-20" />
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Citizen Registration
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-4">
              Complete your digital identity for seamless access to Smart Pokhara Metropolitan services
            </p>
          </div>

          <div className="mb-10 sm:mb-14 px-4 animate-slide-in-right">
            <div className="relative flex items-center justify-between max-w-lg mx-auto">
              <div className="absolute top-6 left-0 w-full h-1.5 bg-muted rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary-brand to-secondary rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep >= step.number;
                const isCurrent = currentStep === step.number;
                
                return (
                  <div key={step.number} className="relative flex flex-col items-center gap-3 z-10">
                    <div className={`
                      h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center
                      transition-all duration-500 border-2 shadow-lg
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary to-secondary border-transparent text-white scale-110' 
                        : 'bg-card border-border text-muted-foreground'
                      }
                      ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse shadow-2xl' : ''}
                    `}>
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6 sm:h-7 sm:w-7 stroke-[3]" />
                      ) : (
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                      )}
                    </div>
                    <span className={`
                      text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300
                      ${isActive ? 'text-primary scale-105' : 'text-muted-foreground'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-gov border-2 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 sm:p-8 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-4">
                {currentStep === 1 ? (
                  <>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                      <User className="h-6 w-6 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Personal Details</h2>
                      <p className="text-sm text-muted-foreground">Provide your official identity information</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center ring-4 ring-secondary/5">
                      <MapPin className="h-6 w-6 text-secondary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Residency Information</h2>
                      <p className="text-sm text-muted-foreground">Complete your address details</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              {currentStep === 1 ? (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Full Name (English) *
                      </label>
                      <input 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                        placeholder="As per citizenship"
                      />
                      {errors.full_name && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-red-600 dark:bg-red-400" />
                          {errors.full_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        पूरा नाम (नेपाली)
                      </label>
                      <input 
                        name="full_name_nepali" 
                        value={formData.full_name_nepali} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                        placeholder="नागरिकता अनुसार"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                          placeholder="98XXXXXXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Gender *
                      </label>
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-red-600 dark:bg-red-400" />
                          {errors.gender}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Date of Birth
                      </label>
                      <input 
                        name="date_of_birth" 
                        type="date" 
                        value={formData.date_of_birth} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Citizenship No.
                      </label>
                      <input 
                        name="citizenship_number" 
                        value={formData.citizenship_number} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                        placeholder="XX-XX-XX-XXXXX"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => validateStep(1) && setCurrentStep(2)} 
                      className="w-full bg-gradient-to-r from-primary to-primary-brand text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue to Address 
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-secondary" />
                      Ward Office *
                    </label>
                    <select 
                      name="ward_id" 
                      value={formData.ward_id} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-200 outline-none"
                    >
                      <option value="">Select Ward</option>
                      {wards.map(w => (
                        <option key={w.id} value={w.id}>
                          Ward {w.ward_number} — {w.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward_id && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-600 dark:bg-red-400" />
                        {errors.ward_id}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Primary Address *
                    </label>
                    <input 
                      name="address_line1" 
                      value={formData.address_line1} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-200 outline-none"
                      placeholder="Tole, House Name/Number"
                    />
                    {errors.address_line1 && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-600 dark:bg-red-400" />
                        {errors.address_line1}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Secondary Address (Optional)
                    </label>
                    <input 
                      name="address_line2" 
                      value={formData.address_line2} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-200 outline-none"
                      placeholder="Additional address details"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-secondary" />
                        Landmark
                      </label>
                      <input 
                        name="landmark" 
                        value={formData.landmark} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-200 outline-none"
                        placeholder="Near Temple, School, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Languages className="h-4 w-4 text-secondary" />
                        Language Preference
                      </label>
                      <select 
                        name="language_preference" 
                        value={formData.language_preference} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-200 outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ne">नेपाली</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button 
                      onClick={() => setCurrentStep(1)} 
                      className="sm:flex-1 bg-background border-2 border-border text-foreground font-semibold py-4 px-6 rounded-xl hover:bg-muted hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                      Back
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading} 
                      className="sm:flex-[2] bg-gradient-to-r from-secondary to-accent-nature text-white font-semibold py-4 px-6 rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          Complete Registration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center px-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted/50 border border-border">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Protected under the Pokhara Metropolitan Privacy Act. Ensure all data matches your government-issued identification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}