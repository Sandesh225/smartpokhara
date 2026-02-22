"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NoticeInput } from "@/types/admin-content";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  FileText,
  Type,
  AlignLeft,
  Tag,
  Globe,
  MapPin,
  AlertCircle,
  Calendar,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isUrgent = watch("is_urgent");

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
      const submission: NoticeInput = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        notice_type: data.notice_type,
        ward_id: data.is_public || data.ward_id === "all" ? null : data.ward_id,
        is_public: data.is_public,
        is_urgent: data.is_urgent,
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 md:space-y-6">
      {/* TITLE */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5" />
          Title
        </Label>
        <Input
          {...register("title")}
          placeholder="e.g. Road Maintenance Alert"
          className={cn(
            "font-medium",
            errors.title && "border-error-red focus-visible:ring-error-red"
          )}
        />
        {errors.title && (
          <p className="text-error-red text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.title.message as string}
          </p>
        )}
      </div>

      {/* EXCERPT */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <AlignLeft className="w-3.5 h-3.5" />
          Excerpt (Short Summary)
        </Label>
        <Input
          {...register("excerpt")}
          placeholder="Brief description for notifications..."
          className={cn(
            "font-medium",
            errors.excerpt && "border-error-red focus-visible:ring-error-red"
          )}
        />
        {errors.excerpt && (
          <p className="text-error-red text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.excerpt.message as string}
          </p>
        )}
      </div>

      {/* TYPE */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          Notice Type
        </Label>
        <Select
          onValueChange={(v) => setValue("notice_type", v as any)}
          defaultValue={initialData?.notice_type || "announcement"}
        >
          <SelectTrigger className="font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="announcement">📢 General Announcement</SelectItem>
            <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
            <SelectItem value="payment">💳 Tax/Payment</SelectItem>
            <SelectItem value="alert">🚨 Emergency Alert</SelectItem>
            <SelectItem value="event">🎉 Event</SelectItem>
            <SelectItem value="public_service">🏛️ Public Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CONTENT */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Content
        </Label>
        <Textarea
          {...register("content")}
          className={cn(
            "h-40 font-medium resize-none",
            errors.content && "border-error-red focus-visible:ring-error-red"
          )}
          placeholder="Full details of the notice..."
        />
        {errors.content && (
          <p className="text-error-red text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.content.message as string}
          </p>
        )}
      </div>

      {/* VISIBILITY SETTINGS */}
      <div className="space-y-4 p-4 md:p-5 border-2 border-border rounded-lg bg-muted/30">
        {/* PUBLIC TOGGLE */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-success-green" />
              <Label className="text-sm font-bold text-foreground">
                Public Notice
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to all citizens (No specific Ward)
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(c) => setValue("is_public", c)}
          />
        </div>

        {/* WARD SELECTION */}
        {!isPublic && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-4 border-t-2 border-border">
            <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              Target Ward
            </Label>
            <Select
              onValueChange={(v) => setValue("ward_id", v)}
              defaultValue={initialData?.ward_id || "all"}
            >
              <SelectTrigger className="border-warning-amber/30 bg-warning-amber/5 font-medium">
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

        {/* URGENT TOGGLE */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-border">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error-red" />
              <Label className="text-sm font-bold text-error-red">
                Urgent Alert
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Sends push notification & pins to top
            </p>
          </div>
          <Switch
            checked={isUrgent}
            onCheckedChange={(c) => setValue("is_urgent", c)}
          />
        </div>
      </div>

      {/* EXPIRY DATE */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          Expires At (Optional)
        </Label>
        <Input
          type="datetime-local"
          {...register("expires_at")}
          className="font-medium"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for notices that don't expire
        </p>
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-border">
        <Button type="submit" disabled={isSubmitting} className="gap-2 font-bold">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Publish Notice
            </>
          )}
        </Button>
      </div>
    </form>
  );
}