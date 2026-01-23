"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Upload, X, Image, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

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
      <div>
        <h2 className="text-xl font-bold mb-1">Additional Details</h2>
        <p className="text-sm text-muted-foreground">
          Provide more information and attach photos
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-destructive">*</span>
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={5}
              placeholder="Describe the issue in detail. Include when it started, its impact, and any other relevant information..."
              className="w-full px-3 py-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          )}
        />
        {errors.description && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            {errors.description.message as string}
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium mb-2">Priority Level</label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "low", label: "Low", color: "border-green-500/50" },
                {
                  value: "medium",
                  label: "Medium",
                  color: "border-amber-500/50",
                },
                { value: "high", label: "High", color: "border-red-500/50" },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => field.onChange(priority.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    field.value === priority.value
                      ? `${priority.color} bg-opacity-10`
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-medium">{priority.label}</span>
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Attachments (Optional)
        </label>

        {/* Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 10MB (max 5 files)
            </p>
          </label>
        </div>

        {/* Preview Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anonymous Toggle */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <Controller
          name="is_anonymous"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="mt-1"
              />
              <div>
                <h4 className="font-semibold text-sm">Submit Anonymously</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your identity will be kept confidential
                </p>
              </div>
            </label>
          )}
        />
      </div>
    </div>
  );
}