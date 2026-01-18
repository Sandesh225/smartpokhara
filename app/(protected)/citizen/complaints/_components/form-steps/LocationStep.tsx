"use client";

import { useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import { MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MapPicker = dynamic(
  () =>
    import("@/app/(protected)/citizen/complaints/_components/form-steps/MapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted animate-pulse rounded-md flex flex-col items-center justify-center border border-border">
        <MapPin className="h-8 w-8 mb-2 animate-bounce text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          Loading map...
        </span>
      </div>
    ),
  }
);

export function LocationStep({ wards }: { wards: any[] }) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedWardId = watch("ward_id");

  const activeWardNumber = useMemo(() => {
    if (!selectedWardId) return undefined;
    const ward = wards.find((w) => w.id === selectedWardId);
    return ward ? parseInt(ward.ward_number) : undefined;
  }, [selectedWardId, wards]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue(
      "location_point",
      {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
      { shouldValidate: true }
    );
    toast.success("Location pinned on map");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Specify Location
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us where the issue is located
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ward <span className="text-destructive">*</span>
            </label>
            <Controller
              name="ward_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const ward = wards.find((w) => w.id === e.target.value);
                    if (ward) {
                      toast.success(`Ward ${ward.ward_number} selected`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select ward...</option>
                  {wards
                    .sort(
                      (a, b) =>
                        parseInt(a.ward_number) - parseInt(b.ward_number)
                    )
                    .map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        Ward {ward.ward_number}{" "}
                        {ward.name ? `- ${ward.name}` : ""}
                      </option>
                    ))}
                </select>
              )}
            />
            {errors.ward_id && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.ward_id.message as string}
              </motion.p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Detailed Address <span className="text-destructive">*</span>
            </label>
            <Controller
              name="address_text"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Provide specific location details, street name, nearby landmarks..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              )}
            />
            {errors.address_text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.address_text.message as string}
              </motion.p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nearby Landmark
            </label>
            <Controller
              name="landmark"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., Near City Hall"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Pin on Map
            </label>
            {activeWardNumber && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20"
              >
                Ward {activeWardNumber}
              </motion.span>
            )}
          </div>

          <div className="flex-1 min-h-[400px] rounded-md overflow-hidden border border-border bg-muted relative">
            <MapPicker
              onLocationSelect={handleLocationSelect}
              selectedWard={activeWardNumber}
            />

            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground pointer-events-none z-[400] flex items-center gap-1.5 shadow-sm">
              <MapPin className="h-3 w-3 text-destructive" />
              Click to pin location
            </div>
          </div>

          {errors.location_point && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 bg-destructive/10 border border-destructive/30 p-2.5 rounded-md"
            >
              <p className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.location_point.message as string}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}