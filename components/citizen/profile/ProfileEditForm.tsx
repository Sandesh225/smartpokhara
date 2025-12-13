"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

import { profileService, type UserProfile } from "@/lib/supabase/queries/profile";

// --- Schema ---
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  full_name_nepali: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be valid")
    .optional()
    .or(z.literal("")),
  ward_id: z.string().min(1, "Please select a ward"),
  address_line1: z.string().min(3, "Address is required"),
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

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
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

  const fullNameErrorId = useId();
  const phoneErrorId = useId();
  const wardErrorId = useId();
  const addressErrorId = useId();

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

  // Revoke object URL on unmount if created
  useEffect(() => {
    return () => {
      // If previewImage is an object URL, it starts with blob:
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Handle Photo Selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    // Immediate Upload (Better UX than waiting for save)
    setIsUploading(true);
    const result = await profileService.uploadProfilePhoto(profile.user_id, file);
    setIsUploading(false);

    if (result.success && result.url) {
      toast.success("Profile photo updated");
      // keep preview image (already set)
    } else {
      toast.error("Failed to upload photo");
      setPreviewImage(profile.profile_photo_url); // Revert
    }
  };

  // Handle Form Submit
  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    const result = await profileService.updateProfile(profile.user_id, data);
    setIsSaving(false);

    if (result.success) {
      toast.success("Profile updated successfully");
      onSave(); // Trigger parent refresh
    } else {
      toast.error("Failed to update profile", { description: result.error });
    }
  };

  const savingOrUploading = isSaving || isUploading;

  return (
    <Card className="border border-gray-200/80 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Edit Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          Keep your details accurate for faster complaint resolution and service delivery.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          {/* Photo Section */}
          <section aria-label="Profile photo" className="rounded-2xl border bg-muted/10 p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-white shadow-md">
                    <AvatarImage src={previewImage || ""} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:opacity-60"
                    aria-label="Change profile photo"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
                    ) : (
                      <Camera className="h-5 w-5 text-gray-700" />
                    )}
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">Profile photo</p>
                  <p className="text-xs text-muted-foreground">
                    JPG/PNG recommended • Max size 5MB
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Change photo
                  </>
                )}
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal Details */}
            <section className="space-y-4" aria-label="Personal information">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Personal Information
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your name and contact details help us reach you quickly.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name (English)</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? fullNameErrorId : undefined}
                  className={errors.full_name ? "border-destructive/60 focus-visible:ring-destructive/20" : ""}
                />
                <FieldError id={fullNameErrorId} message={errors.full_name?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name_nepali">Full Name (Nepali) (Optional)</Label>
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
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? phoneErrorId : undefined}
                  className={errors.phone ? "border-destructive/60 focus-visible:ring-destructive/20" : ""}
                />
                <FieldError id={phoneErrorId} message={errors.phone?.message} />
              </div>
            </section>

            {/* Address Details */}
            <section className="space-y-4" aria-label="Address information">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Address Information
                </h3>
                <p className="text-xs text-muted-foreground">
                  Used to route complaints and notices to the right ward.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward_id">Ward Number</Label>
                <Select
                  onValueChange={(val) => setValue("ward_id", val)}
                  defaultValue={profile.ward_id || ""}
                >
                  <SelectTrigger
                    id="ward_id"
                    aria-invalid={!!errors.ward_id}
                    aria-describedby={errors.ward_id ? wardErrorId : undefined}
                    className={errors.ward_id ? "border-destructive/60 focus:ring-destructive/20" : ""}
                  >
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        Ward {ward.ward_number} - {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError id={wardErrorId} message={errors.ward_id?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">Street Address</Label>
                <Input
                  id="address_line1"
                  {...register("address_line1")}
                  aria-invalid={!!errors.address_line1}
                  aria-describedby={errors.address_line1 ? addressErrorId : undefined}
                  className={errors.address_line1 ? "border-destructive/60 focus-visible:ring-destructive/20" : ""}
                />
                <FieldError id={addressErrorId} message={errors.address_line1?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input id="landmark" {...register("landmark")} />
              </div>
            </section>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/5 p-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={savingOrUploading}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
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
