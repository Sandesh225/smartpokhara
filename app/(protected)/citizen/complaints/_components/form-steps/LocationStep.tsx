"use client";

import { useFormContext, Controller } from "react-hook-form";
import { MapPin, AlertCircle } from "lucide-react";

type Ward = { id: string; ward_number: number; name: string };
type LocationStepProps = { wards: Ward[] };

export function LocationStep({ wards }: LocationStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-1">Location Information</h2>
        <p className="text-sm text-muted-foreground">
          Specify where the issue is located
        </p>
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
            <select
              {...field}
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select ward...</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  Ward {ward.ward_number} - {ward.name}
                </option>
              ))}
            </select>
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
            <textarea
              {...field}
              rows={3}
              placeholder="Enter street name, landmark, or other location details..."
              className="w-full px-3 py-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
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
              Adding GPS coordinates helps our team locate the issue precisely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}