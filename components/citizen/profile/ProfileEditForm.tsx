"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Camera,
  Loader2,
  Save,
  X,
  UploadCloud,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import {
  profileService,
  type UserProfile,
} from "@/lib/supabase/queries/profile";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  full_name_nepali: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  ward_id: z.string().min(1, "Please select your ward"),
  address_line1: z.string().min(3, "Primary address is required"),
  address_line2: z.string().optional(),
  landmark: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: UserProfile;
  wards: { id: string; name: string; ward_number: number }[];
  onCancel: () => void;
  onSave: () => void;
}

export default function ProfileEditForm({
  profile,
  wards,
  onCancel,
  onSave,
}: ProfileEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    profile.profile_photo_url
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      full_name_nepali: profile.full_name_nepali || "",
      phone: profile.phone || "",
      ward_id: profile.ward_id || "",
      address_line1: profile.address_line1 || "",
      address_line2: profile.address_line2 || "",
      landmark: profile.landmark || "",
    },
  });

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    setIsUploading(true);
    const result = await profileService.uploadProfilePhoto(
      profile.user_id,
      file
    );
    setIsUploading(false);

    if (result.success && result.url) {
      toast.success("Photo updated successfully");
    } else {
      toast.error("Failed to upload photo");
      setPreviewImage(profile.profile_photo_url);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    const result = await profileService.updateProfile(profile.user_id, data);
    setIsSaving(false);

    if (result.success) {
      toast.success("Profile updated successfully");
      onSave();
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="pb-6 border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-28 w-28 border-2 border-slate-200 shadow-sm transition-all group-hover:border-blue-400">
                <AvatarImage
                  src={previewImage || ""}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={isUploading}
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="font-medium text-slate-900">Profile Picture</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Upload a clear photo of yourself. This helps officials verify
                your identity. JPG, GIF or PNG. Max size 5MB.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload New Photo
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-slate-900">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  className={cn(
                    errors.full_name &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name_nepali">Full Name (Nepali)</Label>
                <Input
                  id="full_name_nepali"
                  {...register("full_name_nepali")}
                  placeholder="नेपालीमा नाम"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  className={cn(
                    errors.phone && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Address Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ward_id">
                  Ward Number <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) => setValue("ward_id", val)}
                  defaultValue={profile.ward_id || ""}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full md:w-[50%]",
                      errors.ward_id && "border-red-500 focus:ring-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select your Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        Ward No. {ward.ward_number} - {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ward_id && (
                  <p className="text-xs text-red-500">
                    {errors.ward_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_line1"
                  {...register("address_line1")}
                  placeholder="Tole/Street Name"
                  className={cn(
                    errors.address_line1 &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.address_line1 && (
                  <p className="text-xs text-red-500">
                    {errors.address_line1.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                <Input
                  id="address_line2"
                  {...register("address_line2")}
                  placeholder="Apartment, House No, etc."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="landmark">Nearby Landmark</Label>
                <Input
                  id="landmark"
                  {...register("landmark")}
                  placeholder="E.g., Near Temple, Behind School"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 bg-slate-50/50 border-t p-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}