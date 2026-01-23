"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";

// Initialize Supabase (replace with your actual credentials)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function ProfileCompletion() {
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
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
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWards();
  }, []);

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
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.full_name || formData.full_name.trim().length < 3) {
        newErrors.full_name = "Name must be at least 3 characters";
      }
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
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
        newErrors.address_line1 = "Address required";
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

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) throw new Error("Not authenticated");

      if (formData.phone) {
        await supabase
          .from("users")
          .update({ phone: formData.phone })
          .eq("id", user.id);
      }

      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        full_name_nepali: formData.full_name_nepali || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        citizenship_number: formData.citizenship_number || null,
        ward_id: formData.ward_id || null,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || null,
        landmark: formData.landmark || null,
        language_preference: formData.language_preference
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/citizen/dashboard";
      }, 2000);

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Completed!</h2>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Help us serve you better with some basic information
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-border'}`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">Personal</span>
            </div>
            <ChevronRight className="text-muted-foreground" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-border'}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Address</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border">
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full rounded-xl bg-background px-4 py-3 border-2 ${
                    errors.full_name ? 'border-destructive' : 'border-border focus:border-primary'
                  } outline-none transition-all`}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name (Nepali)</label>
                <input
                  name="full_name_nepali"
                  type="text"
                  value={formData.full_name_nepali}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                  placeholder="जोन डो"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-xl bg-background pl-11 pr-4 py-3 border-2 ${
                        errors.phone ? 'border-destructive' : 'border-border focus:border-primary'
                      } outline-none transition-all`}
                      placeholder="9812345678"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full rounded-xl bg-background px-4 py-3 border-2 ${
                      errors.gender ? 'border-destructive' : 'border-border focus:border-primary'
                    } outline-none transition-all`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-background pl-11 pr-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Citizenship Number</label>
                  <input
                    name="citizenship_number"
                    type="text"
                    value={formData.citizenship_number}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-background px-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-6 bg-primary hover:bg-secondary text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg"
              >
                Next: Address Details
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Address Information
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ward *</label>
                <select
                  name="ward_id"
                  value={formData.ward_id}
                  onChange={handleChange}
                  className={`w-full rounded-xl bg-background px-4 py-3 border-2 ${
                    errors.ward_id ? 'border-destructive' : 'border-border focus:border-primary'
                  } outline-none transition-all`}
                >
                  <option value="">Select Ward</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward_id && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ward_id}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address Line 1 *</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <input
                    name="address_line1"
                    type="text"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className={`w-full rounded-xl bg-background pl-11 pr-4 py-3 border-2 ${
                      errors.address_line1 ? 'border-destructive' : 'border-border focus:border-primary'
                    } outline-none transition-all`}
                    placeholder="Street name, house number"
                  />
                </div>
                {errors.address_line1 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address_line1}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address Line 2</label>
                <input
                  name="address_line2"
                  type="text"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                  placeholder="Tole, Area (optional)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Landmark</label>
                <input
                  name="landmark"
                  type="text"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                  placeholder="Near temple, school, etc."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Preferred Language</label>
                <select
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3 border-2 border-border focus:border-primary outline-none transition-all"
                >
                  <option value="en">English</option>
                  <option value="ne">Nepali</option>
                </select>
              </div>

              {errors.submit && (
                <div className="bg-destructive/10 border border-destructive rounded-xl p-4">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-border hover:bg-accent font-semibold py-3.5 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-secondary text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70"
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
      </div>
    </div>
  );
}