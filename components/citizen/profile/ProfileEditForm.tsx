"use client";

import { useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileService } from "@/lib/supabase/queries/profile";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  full_name_nepali: z.string().optional(),
  phone: z
    .string()
    .min(10, "Valid phone required")
    .optional()
    .or(z.literal("")),
  ward_id: z.string().min(1, "Select ward"),
  address_line1: z.string().min(3, "Address required"),
});

export default function ProfileEditForm({
  profile,
  wards,
  onCancel,
  onSave,
}: any) {
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
      toast.success("Identity Updated");
      onSave();
    } else toast.error("Failed to update profile");
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const result = await profileService.uploadProfilePhoto(
      profile.user_id,
      file
    );
    setIsUploading(false);
    if (result.success) {
      setPreviewImage(result.url);
      toast.success("Photo Synchronized");
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Identity
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-10 space-y-10">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row gap-8 items-center bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                <AvatarImage
                  src={previewImage || ""}
                  className="object-cover"
                />
                <AvatarFallback className="font-black text-slate-300">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-slate-900">Display Photo</h3>
              <p className="text-xs text-slate-500 font-medium">
                Used for verification by city officials.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 rounded-xl h-9"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Change Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoSelect}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name (English)
              </Label>
              <Input
                {...register("full_name")}
                className="h-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name (Nepali)
              </Label>
              <Input
                {...register("full_name_nepali")}
                className="h-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50 font-semibold"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Administrative Ward
              </Label>
              <Select
                value={profile.ward_id || "all"}
                onValueChange={(v) => setValue("ward_id", v)}
              >
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 font-bold">
                  <SelectValue placeholder="Locate Ward" />
                </SelectTrigger>
                {/* FIX: Scrolling Ward selection */}
                <SelectContent className="max-h-[300px] rounded-2xl shadow-2xl border-slate-100">
                  {wards.map((ward: any) => (
                    <SelectItem
                      key={ward.id}
                      value={ward.id}
                      className="font-medium"
                    >
                      Ward No. {ward.ward_number} — {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Residency Address
              </Label>
              <Input
                {...register("address_line1")}
                className="h-12 rounded-2xl border-slate-200"
                placeholder="Street, Tole, Landmark"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-12 px-8 rounded-2xl font-bold border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Save Identity"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}