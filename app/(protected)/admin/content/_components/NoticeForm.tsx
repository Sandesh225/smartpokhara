"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NoticeInput } from "@/types/admin-content";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

// Schema Validation
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  notice_type: z.enum([
    "announcement",
    "maintenance",
    "payment",
    "event",
    "alert",
    "public_service",
  ]),
  ward_id: z.string().optional(),
  is_public: z.boolean().default(true),
  is_urgent: z.boolean().default(false),
  expires_at: z.string().optional(),
});

interface NoticeFormProps {
  onSubmit: (data: NoticeInput) => Promise<void>;
  initialData?: Partial<NoticeInput>;
}

export function NoticeForm({ onSubmit, initialData }: NoticeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      notice_type: initialData?.notice_type || "announcement",
      ward_id: initialData?.ward_id || "all",
      is_public: initialData?.is_public ?? true,
      is_urgent: initialData?.is_urgent ?? false,
      expires_at: initialData?.expires_at || "",
    },
  });

  const [wards, setWards] = useState<any[]>([]);
  const isPublic = watch("is_public");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("wards")
      .select("id, ward_number, name")
      .order("ward_number")
      .then(({ data }) => setWards(data || []));
  }, []);

  const onFormSubmit = async (data: any) => {
    try {
      // Convert form state to API payload
      const submission: NoticeInput = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        notice_type: data.notice_type,
        // Force ward_id to null if it's public or 'all'
        ward_id: data.is_public || data.ward_id === "all" ? null : data.ward_id,
        is_public: data.is_public,
        is_urgent: data.is_urgent,
        // Use undefined for current time, logic handled in queries file
        published_at: undefined,
        expires_at: data.expires_at
          ? new Date(data.expires_at).toISOString()
          : undefined,
      };
      await onSubmit(submission);
    } catch (error) {
      console.error("Form submission error", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            {...register("title")}
            placeholder="e.g. Road Maintenance Alert"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Excerpt (Short Summary)</Label>
          <Input
            {...register("excerpt")}
            placeholder="Brief description for notifications..."
          />
          {errors.excerpt && (
            <p className="text-red-500 text-xs">
              {errors.excerpt.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            onValueChange={(v) => setValue("notice_type", v as any)}
            defaultValue={initialData?.notice_type || "announcement"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">General Announcement</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="payment">Tax/Payment</SelectItem>
              <SelectItem value="alert">Emergency Alert</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="public_service">Public Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            {...register("content")}
            className="h-40"
            placeholder="Full details..."
          />
          {errors.content && (
            <p className="text-red-500 text-xs">
              {errors.content.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Notice</Label>
              <p className="text-xs text-gray-500">
                Visible to all citizens (No specific Ward)
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={(c) => setValue("is_public", c)}
            />
          </div>

          {!isPublic && (
            <div className="space-y-2 animate-in fade-in">
              <Label>Target Ward</Label>
              <Select
                onValueChange={(v) => setValue("ward_id", v)}
                defaultValue={initialData?.ward_id || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled>
                    Select a Ward...
                  </SelectItem>
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      Ward {w.ward_number} - {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <Label className="text-red-600">Urgent Alert</Label>
              <p className="text-xs text-gray-500">Sends push notification</p>
            </div>
            <Switch
              checked={watch("is_urgent")}
              onCheckedChange={(c) => setValue("is_urgent", c)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Expires At (Optional)</Label>
          <Input
            type="datetime-local"
            {...register("expires_at")}
            className="block w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Publishing..." : "Publish Notice"}
        </Button>
      </div>
    </form>
  );
}