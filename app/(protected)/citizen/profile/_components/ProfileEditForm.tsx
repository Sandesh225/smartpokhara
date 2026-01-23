"use client";

import type React from "react";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileService } from "@/lib/supabase/queries/profile";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  full_name_nepali: z.string().optional(),
  phone: z.string().min(10, "Valid phone required").optional().or(z.literal("")),
  ward_id: z.string().min(1, "Select ward"),
  address_line1: z.string().min(3, "Address required"),
});

export default function ProfileEditForm({ profile, wards, onCancel, onSave }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(profile.profile_photo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedWardId, setSelectedWardId] = useState(profile.ward_id || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      full_name_nepali: profile.full_name_nepali || "",
      phone: profile.phone || "",
      ward_id: profile.ward_id || "",
      address_line1: profile.address_line1 || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    const result = await profileService.updateProfile(profile.user_id, data);
    setIsSaving(false);
    if (result.success) {
      toast.success("Profile updated successfully");
      onSave();
    } else toast.error("Failed to update profile");
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const result = await profileService.uploadProfilePhoto(profile.user_id, file);
    setIsUploading(false);
    if (result.success) {
      setPreviewImage(result.url);
      toast.success("Photo updated successfully");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Edit Profile</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-muted/50 rounded-lg">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={previewImage || ""} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-semibold">Profile Photo</h3>
              <p className="text-xs text-muted-foreground">
                Used for verification by city officials
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" /> Change Photo
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name (English) *</Label>
              <Input
                {...register("full_name")}
                className="h-10"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Full Name (Nepali)</Label>
              <Input
                {...register("full_name_nepali")}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                {...register("phone")}
                className="h-10 font-mono"
                placeholder="98XXXXXXXX"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ward *</Label>
              <Select 
                value={selectedWardId} 
                onValueChange={(v) => {
                  setSelectedWardId(v);
                  setValue("ward_id", v);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward: any) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ward_id && (
                <p className="text-xs text-destructive">{errors.ward_id.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Residential Address *</Label>
              <Input
                {...register("address_line1")}
                className="h-10"
                placeholder="Street, Tole, Landmark"
              />
              {errors.address_line1 && (
                <p className="text-xs text-destructive">{errors.address_line1.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}