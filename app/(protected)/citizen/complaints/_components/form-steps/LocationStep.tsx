"use client";

import { useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import { MapPin, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dynamic import for Map to prevent SSR errors
const MapPicker = dynamic(() => import("@/app/(protected)/citizen/complaints/_components/form-steps/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl flex flex-col items-center justify-center text-slate-400 font-medium border-2 border-dashed border-slate-200">
      <MapPin className="h-8 w-8 mb-2 animate-bounce text-slate-300" />
      <span className="text-sm">Loading Pokhara Map...</span>
    </div>
  ),
});

export function LocationStep({ wards }: { wards: any[] }) {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  
  // 1. Watch the selected Ward ID from the form
  const selectedWardId = watch("ward_id");
  
  // 2. Find the actual Ward Number (e.g., "5", "12") to pass to the Map
  const activeWardNumber = useMemo(() => {
    if (!selectedWardId) return undefined;
    const ward = wards.find(w => w.id === selectedWardId);
    // Ensure we parse it as a number for the coordinate lookup
    return ward ? parseInt(ward.ward_number) : undefined;
  }, [selectedWardId, wards]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    // Save GeoJSON Point to form
    setValue("location_point", {
      type: "Point",
      coordinates: [location.lng, location.lat]
    }, { shouldValidate: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Form Inputs */}
      <div className="space-y-6">
        
        {/* Ward Selection */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-slate-800">
            Select Ward <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="ward_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-14 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-4 text-base shadow-sm">
                  <SelectValue placeholder="Choose a Pokhara Ward..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {wards
                    .sort((a, b) => parseInt(a.ward_number) - parseInt(b.ward_number))
                    .map((ward) => (
                    <SelectItem key={ward.id} value={ward.id} className="py-3 cursor-pointer">
                      <span className="font-bold text-blue-900 text-base">Ward {ward.ward_number}</span> 
                      <span className="text-slate-500 ml-2 text-sm uppercase font-medium">
                        {ward.name ? `- ${ward.name}` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ward_id && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4" /> {errors.ward_id.message as string}
            </p>
          )}
        </div>

        {/* Address Text */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-slate-800">
            Exact Location / Tole <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="address_text"
            control={control}
            render={({ field }) => (
              <Textarea 
                {...field} 
                placeholder="e.g. 200m ahead of Davis Falls entrance, opposite XYZ Pasal..."
                className="min-h-[140px] bg-white border-slate-200 resize-none p-4 text-base rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            )}
          />
          {errors.address_text && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4" /> {errors.address_text.message as string}
            </p>
          )}
        </div>

        {/* Landmark */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-slate-800">Nearby Landmark</Label>
          <Input 
            {...control.register("landmark")} 
            placeholder="e.g. Near Fewa Lake Boat Station" 
            className="h-14 bg-white border-slate-200 rounded-xl px-4 text-base shadow-sm"
          />
        </div>
      </div>

      {/* Right Column: Interactive Map */}
      <div className="space-y-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-base font-bold flex items-center gap-2 text-blue-800">
            <MapPin className="h-5 w-5 text-blue-600" /> Pin Exact Spot
          </Label>
          {activeWardNumber && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5 animate-in fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Navigating to Ward {activeWardNumber}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-h-[450px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md relative group bg-slate-50">
           {/* Pass the activeWardNumber prop here */}
           <MapPicker 
              onLocationSelect={handleLocationSelect} 
              selectedWard={activeWardNumber} 
           />
           
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-100 text-xs font-bold text-slate-700 pointer-events-none z-[400] flex items-center gap-2">
              <MapPin className="h-3 w-3 text-red-500" /> Tap map to pin location
           </div>
        </div>
        
        {errors.location_point && (
             <Alert variant="destructive" className="mt-2 py-3 bg-red-50 border-red-200 text-red-900 rounded-xl">
                <AlertDescription className="flex items-center gap-2 font-bold text-sm">
                  <MapPin className="h-5 w-5 text-red-600" /> Location Pin is required.
                </AlertDescription>
             </Alert>
        )}
      </div>
    </div>
  );
}