"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Upload, X, Image, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DetailsStepProps = {
  attachments: File[];
  setAttachments: (files: File[]) => void;
  previews: string[];
  setPreviews: (previews: string[]) => void;
};

export function DetailsStep({
  attachments,
  setAttachments,
  previews,
  setPreviews,
}: DetailsStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + attachments.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setAttachments([...attachments, ...validFiles]);

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setAttachments(attachments.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 pb-6 border-b border-border">
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Operational Details</h2>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          Provide comprehensive data and visual identifiers for the mission.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
          Operational Narrative <span className="text-primary ml-1">•</span>
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={6}
              placeholder="Provide a multi-vector description of the issue. Include temporal data, impact assessments, and environmental markers..."
              className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-sm font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all hover:border-primary/20"
            />
          )}
        />
        {errors.description && (
          <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.description.message as string}
          </div>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">Urgency Protocol</label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "low", label: "Protocol Delta", color: "bg-success-green", border: "border-success-green/20" },
                { value: "medium", label: "Protocol Beta", color: "bg-warning-amber", border: "border-warning-amber/20" },
                { value: "high", label: "Protocol Alpha", color: "bg-destructive", border: "border-destructive/20" },
              ].map((priority) => {
                const isSelected = field.value === priority.value;
                return (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => field.onChange(priority.value)}
                    className={cn(
                      "relative h-12 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center overflow-hidden group",
                      isSelected
                        ? cn(priority.border, "bg-card shadow-lg shadow-black/5")
                        : "border-border bg-card hover:border-primary/20"
                    )}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="priority-bg"
                        className={cn("absolute inset-0 opacity-5", priority.color)} 
                      />
                    )}
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest relative z-10",
                      isSelected ? "text-foreground" : "text-muted-foreground/40"
                    )}>
                      {priority.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
          Evidence Attachments <span className="text-muted-foreground/40 font-bold ml-1">(Optional)</span>
        </label>

        {/* Upload Area */}
        <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto shadow-xs group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-foreground">
                Deploy Visual Records
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                JPG, PNG • Resolution capped at 10MB per object
              </p>
            </div>
          </label>
        </div>

        {/* Preview Grid */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-6"
            >
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-card shadow-xs"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 bg-destructive text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-3.5 h-3.5 stroke-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anonymous Toggle */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-border bg-muted/20 group">
        <Controller
          name="is_anonymous"
          control={control}
          render={({ field }) => (
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Anonymity Protocol</h4>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Seal identity vectors and restrict metadata Access.
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="sr-only"
                />
                <div className={cn(
                  "w-12 h-6 rounded-full transition-all duration-300 border",
                  field.value ? "bg-primary border-primary" : "bg-card border-border"
                )}>
                  <motion.div
                    animate={{ x: field.value ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "w-4 h-4 rounded-full m-0.5 shadow-sm",
                      field.value ? "bg-primary-foreground" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
              </div>
            </label>
          )}
        />
      </div>
    </div>
  );
}