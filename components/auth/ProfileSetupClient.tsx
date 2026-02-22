"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  FileText,
  Loader2,
  ChevronRight,
  Check,
  Languages,
  Shield,
  Building2,
  Calendar,
  Fingerprint,
  ArrowLeft,
  Info,
  AlertCircle,
  Trophy,
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
  const [fetching, setFetching] = useState(true);
  const [wards, setWards] = useState<Ward[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    language_preference: "en",
  });

  useEffect(() => {
    const initialize = async () => {
      setFetching(true);
      // 1. Fetch Wards first so we can map IDs later
      const wardsList = await fetchWards();

      // 2. Load Profile and map data using the wards list
      if (wardsList) {
        await loadExistingProfile(wardsList);
      }
      setFetching(false);
    };
    initialize();
  }, []);

  const fetchWards = async () => {
    const { data } = await supabase
      .from("wards")
      .select("*")
      .eq("is_active", true)
      .order("ward_number");

    setWards(data || []);
    return data;
  };

  const loadExistingProfile = async (currentWards: Ward[]) => {
    try {
      // A. Get Data from Public Profile (RPC)
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "rpc_get_user_profile"
      );
      if (rpcError) console.error("RPC Error:", rpcError);

      // B. Get Data from Auth Metadata (Fallback for Seed Data)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Logic: Prioritize RPC Profile -> Then Auth Metadata -> Then Empty String
      const meta = user?.user_metadata || {};

      // Attempt to find Ward UUID if only Ward Number exists in metadata
      let prefilledWardId = rpcData?.profile?.ward_id || "";
      if (!prefilledWardId && meta.ward) {
        const foundWard = currentWards.find(
          (w) => w.ward_number === Number(meta.ward)
        );
        if (foundWard) prefilledWardId = foundWard.id;
      }

      setFormData((prev) => ({
        ...prev,
        // Identity
        full_name: rpcData?.profile?.full_name || meta.full_name || "",
        full_name_nepali: rpcData?.profile?.full_name_nepali || "",
        phone: rpcData?.user?.phone || user?.phone || meta.phone || "",
        gender: rpcData?.profile?.gender || meta.gender || "",
        date_of_birth: rpcData?.profile?.date_of_birth || "",
        citizenship_number: rpcData?.profile?.citizenship_number || "",

        // Location
        ward_id: prefilledWardId,
        address_line1: rpcData?.profile?.address_line1 || meta.address || "",
        address_line2: rpcData?.profile?.address_line2 || "",
        landmark: rpcData?.profile?.landmark || "",
        language_preference: rpcData?.profile?.language_preference || "en",
      }));
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.full_name.trim())
        newErrors.full_name = "Full Name is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    } else if (step === 2) {
      if (!formData.ward_id) newErrors.ward_id = "Ward selection is required";
      if (!formData.address_line1.trim())
        newErrors.address_line1 = "Address is required";
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
        p_date_of_birth: formData.date_of_birth ? formData.date_of_birth : null,
        p_gender: formData.gender,
        p_citizenship_number: formData.citizenship_number,
        p_ward_id: formData.ward_id ? formData.ward_id : null,
        p_address_line1: formData.address_line1,
        p_address_line2: formData.address_line2,
        p_landmark: formData.landmark,
        p_language_preference: formData.language_preference,
      });

      if (error) throw error;

      // DYNAMIC REDIRECTION: Fetch route based on role
      const { data: config } = await supabase.rpc("rpc_get_dashboard_config");
      const targetRoute = config?.dashboard_config?.default_route || "/citizen/dashboard";

      toast.success("Profile successfully activated!", { id: toastId });
      
      // SHOW SUCCESS SCREEN
      setIsSuccess(true);
      
      // Delay to allow animation to show
      setTimeout(() => {
        router.push(targetRoute);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">
            Syncing data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_40%)] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="relative z-10 container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex p-4 rounded-3xl bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20 mb-4 shadow-xl shadow-primary/5">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            Digital Identity Setup
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Please verify your details to access Smart Pokhara services.
          </p>
        </div>

        {/* Multi-Step Progress */}
        <div className="mb-12 relative max-w-md mx-auto">
          <div className="flex justify-between items-center relative z-10">
            {[1, 2].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => step < currentStep && setCurrentStep(step)}
              >
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    currentStep >= step
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : "bg-card border-border text-muted-foreground group-hover:border-primary/50"
                  }`}
                >
                  {step === 1 ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                    currentStep >= step
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {step === 1 ? "Identity" : "Location"}
                </span>
              </div>
            ))}
          </div>
          {/* Progress Line */}
          <div className="absolute top-6 left-0 w-full h-0.5 bg-border z-0">
            <div
              className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              style={{ width: currentStep === 1 ? "0%" : "100%" }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-300 ring-1 ring-white/5 min-h-[500px] flex flex-col justify-center">
          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center text-center space-y-6 py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{
                      scale: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 },
                      rotate: { type: "tween", duration: 0.5, delay: 0.2 },
                    }}
                    className="h-24 w-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40"
                  >
                    <Trophy className="h-12 w-12 text-primary-foreground" />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
                      Welcome to Digital Pokhara!
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Your profile has been verified and activated.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to your dashboard...
                  </div>
                </motion.div>
              ) : currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <Fingerprint className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Personal Information</h2>
                      <p className="text-xs text-muted-foreground">
                        Official identification details
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Full Name English */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        Full Name (English) <span className="text-primary">*</span>
                      </label>
                      <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="e.g. Arjun Kumar Karki"
                        className={`w-full bg-background/50 border-2 px-4 py-3 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none ${
                          errors.full_name
                            ? "border-destructive focus:border-destructive"
                            : "border-input/50 focus:border-primary"
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-xs text-destructive font-medium flex gap-1 items-center">
                          <AlertCircle className="h-3 w-3" />
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Full Name Nepali */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">पूरा नाम (नेपाली)</label>
                      <input
                        name="full_name_nepali"
                        value={formData.full_name_nepali}
                        onChange={handleChange}
                        placeholder="e.g. अर्जुन कुमार कार्की"
                        className="w-full bg-background/50 border-2 border-input/50 px-4 py-3 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        Mobile Number <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="98XXXXXXXX"
                          className={`w-full bg-background/50 border-2 pl-11 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none ${
                            errors.phone ? "border-destructive" : "border-input/50 focus:border-primary"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive font-medium flex gap-1 items-center">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        Gender <span className="text-primary">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full bg-background/50 border-2 px-4 py-3 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none ${
                          errors.gender ? "border-destructive" : "border-input/50 focus:border-primary"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* DOB */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Date of Birth
                      </label>
                      <input
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full bg-background/50 border-2 border-input/50 px-4 py-3 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      />
                    </div>

                    {/* Citizenship */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" /> Citizenship Number
                      </label>
                      <input
                        name="citizenship_number"
                        value={formData.citizenship_number}
                        onChange={handleChange}
                        placeholder="XX-XX-XX-XXXX"
                        className="w-full bg-background/50 border-2 border-input/50 px-4 py-3 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => validateStep(1) && setCurrentStep(2)}
                      className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                    >
                      Continue to Address
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Residential Details</h2>
                      <p className="text-xs text-muted-foreground">Current living address</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {/* Ward Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" /> Ward Office
                        <span className="text-primary">*</span>
                      </label>
                      <select
                        name="ward_id"
                        value={formData.ward_id}
                        onChange={handleChange}
                        className={`w-full bg-background/50 border-2 px-4 py-3 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none ${
                          errors.ward_id ? "border-destructive" : "border-input/50 focus:border-primary"
                        }`}
                      >
                        <option value="">Select Your Ward</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            Ward No. {w.ward_number} — {w.name}
                          </option>
                        ))}
                      </select>
                      {errors.ward_id && (
                        <p className="text-xs text-destructive font-medium flex gap-1 items-center">
                          <AlertCircle className="h-3 w-3" />
                          {errors.ward_id}
                        </p>
                      )}
                    </div>

                    {/* Address Line 1 */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Primary Address <span className="text-primary">*</span>
                      </label>
                      <input
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        placeholder="Tole, House Number or Area Name"
                        className={`w-full bg-background/50 border-2 px-4 py-3 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none ${
                          errors.address_line1 ? "border-destructive" : "border-input/50 focus:border-primary"
                        }`}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Landmark</label>
                        <input
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          placeholder="Near Temple, School, or Chowk"
                          className="w-full bg-background/50 border-2 border-input/50 px-4 py-3 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                          <Languages className="h-4 w-4" /> Language Preference
                        </label>
                        <select
                          name="language_preference"
                          value={formData.language_preference}
                          onChange={handleChange}
                          className="w-full bg-background/50 border-2 border-input/50 px-4 py-3 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        >
                          <option value="en">English</option>
                          <option value="ne">नेपाली (Nepali)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-muted/50 text-foreground font-bold py-4 rounded-xl border-2 border-border/50 hover:bg-muted transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-2 bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Activate Profile"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Info */}
          <div className="bg-muted/30 p-6 flex gap-4 items-start border-t border-border/50">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Data Privacy Notice:</strong> This information is
              collected under the Smart Pokhara Digital Governance Act. Your
              data is encrypted and used solely for identity verification and
              municipal service delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}