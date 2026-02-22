"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { MapPin, AlertCircle, Home, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Zone Assignment</h2>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Specify the geographic coordinates or sector for resolution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fillFromProfile(false)}
          disabled={loadingProfile}
          className="inline-flex items-center gap-3 px-6 h-11 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all active:scale-95 border border-primary/10 shadow-xs"
        >
          {loadingProfile ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Home className="w-3.5 h-3.5" />
          )}
          Import Profile Vectors
        </button>
      </div>

      {/* Sector Selection */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
          Assigned Ward <span className="text-primary ml-1">•</span>
        </label>
        <Controller
          name="ward_id"
          control={control}
          render={({ field }) => (
            <div className="relative group">
              <select
                {...field}
                className="w-full h-12 px-5 rounded-xl border border-border bg-background text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all group-hover:border-primary/20"
              >
                <option value="">Select Sector Specification...</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Sector 0{ward.ward_number} — {ward.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          )}
        />
        {errors.ward_id && (
          <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.ward_id.message as string}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
          Detailed Location Identity <span className="text-primary ml-1">•</span>
        </label>
        <Controller
          name="address_text"
          control={control}
          render={({ field }) => (
            <div className="relative group">
              <textarea
                {...field}
                rows={4}
                placeholder="Enter street name, landmark markers, or specific operational zone data..."
                className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-sm font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all group-hover:border-primary/20"
              />
              {/* Magic Wand Hint */}
              {!field.value && !loadingProfile && (
                <button
                  type="button"
                  onClick={() => fillFromProfile(false)}
                  className="absolute bottom-4 right-4 p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-xs"
                  title="Auto-fill from profile"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        />
        {errors.address_text && (
          <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.address_text.message as string}
          </div>
        )}
      </div>

      {/* GPS Coordinates (Optional) */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-border bg-muted/20 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-card border border-border rounded-xl shadow-xs">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
              Geospatial Vectoring <span className="text-muted-foreground/40 font-bold ml-1">(Optional)</span>
            </h4>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 max-w-sm">
              Attaching precise GPS telemetry facilitates high-accuracy resolution. Coordinates will be requested upon final submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}