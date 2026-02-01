"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { MapPin, AlertCircle, Home, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Ward = { id: string; ward_number: number; name: string };
type LocationStepProps = { wards: Ward[] };

export function LocationStep({ wards }: LocationStepProps) {
  const supabase = createClient();
  const [loadingProfile, setLoadingProfile] = useState(false);

  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  /**
   * Fetches the user's profile and populates the form fields
   * @param isAuto boolean - Supresses success toast if running automatically on mount
   */
  const fillFromProfile = async (isAuto = false) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase.rpc("rpc_get_user_profile");

      if (error) throw error;

      if (data?.profile?.is_complete) {
        const { ward_id, address_line1, address_line2, landmark } =
          data.profile;

        // 1. Set Ward
        if (ward_id) {
          setValue("ward_id", ward_id, { shouldValidate: true });
        }

        // 2. Format Address (Combine Line 1 & 2 & Landmark for a complete picture)
        let formattedAddress = address_line1 || "";
        if (address_line2) formattedAddress += `, ${address_line2}`;
        if (landmark) formattedAddress += ` (Near ${landmark})`;

        if (formattedAddress) {
          setValue("address_text", formattedAddress, { shouldValidate: true });
        }

        if (!isAuto) {
          toast.success("Filled with your registered address");
        }
      } else if (!isAuto) {
        toast.error("Profile incomplete. Please update your profile settings.");
      }
    } catch (err) {
      console.error("Auto-fill error:", err);
      if (!isAuto) toast.error("Could not fetch profile details");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Effect: Auto-fill only if fields are empty on mount
  useEffect(() => {
    const currentWard = getValues("ward_id");
    const currentAddress = getValues("address_text");

    if (!currentWard && !currentAddress) {
      fillFromProfile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Auto-fill Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Location Information</h2>
          <p className="text-sm text-muted-foreground">
            Specify where the issue is located
          </p>
        </div>

        <button
          type="button"
          onClick={() => fillFromProfile(false)}
          disabled={loadingProfile}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors self-start sm:self-center"
        >
          {loadingProfile ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Home className="w-3.5 h-3.5" />
          )}
          Use my registered address
        </button>
      </div>

      {/* Ward Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Ward <span className="text-destructive">*</span>
        </label>
        <Controller
          name="ward_id"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <select
                {...field}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="">Select ward...</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.ward_number} - {ward.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          )}
        />
        {errors.ward_id && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.ward_id.message as string}
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Detailed Address <span className="text-destructive">*</span>
        </label>
        <Controller
          name="address_text"
          control={control}
          render={({ field }) => (
            <div className="relative group">
              <textarea
                {...field}
                rows={3}
                placeholder="Enter street name, landmark, or other location details..."
                className="w-full px-3 py-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {/* Magic Wand Hint */}
              {!field.value && !loadingProfile && (
                <button
                  type="button"
                  onClick={() => fillFromProfile(false)}
                  className="absolute bottom-3 right-3 text-muted-foreground hover:text-primary transition-colors"
                  title="Auto-fill from profile"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        />
        {errors.address_text && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.address_text.message as string}
          </div>
        )}
      </div>

      {/* GPS Coordinates (Optional) */}
      <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">
              GPS Location (Optional)
            </h4>
            <p className="text-xs text-muted-foreground">
              Adding GPS coordinates helps our team locate the issue precisely.
              (Your current location will be requested upon submission if
              supported).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}