"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Upload, X, ImageIcon, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DetailsStepProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  previews: string[];
  setPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}`, {
          description: "Maximum 5MB allowed per file",
        });
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Invalid format: ${file.name}`, {
          description: "Only JPG, PNG, and WEBP supported",
        });
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...validPreviews]);
      toast.success(`${validFiles.length} photo(s) added`);
    }

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const fileName = attachments[index]?.name;
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    toast.info(`Removed: ${fileName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Provide Details
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Describe the issue and add supporting evidence
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description <span className="text-destructive">*</span>
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Describe the issue in detail. When did it start? How severe is it? Who is affected?"
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          )}
        />
        {errors.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.description.message as string}
          </motion.p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          Photos (Optional)
        </label>

        <div className="relative border-2 border-dashed border-border rounded-md p-8 hover:border-primary/50 transition-colors bg-muted/30 hover:bg-muted/50 cursor-pointer group">
          <input
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm text-foreground">
                Click or drag photos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Previews */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4"
            >
              {previews.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative aspect-square rounded-md overflow-hidden border border-border group bg-card"
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    alt={`Preview ${i}`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-[9px] text-white truncate font-medium">
                      {attachments[i]?.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anonymous Option */}
      <div className="bg-muted/50 border border-border p-4 rounded-md">
        <label className="flex items-start gap-3 cursor-pointer">
          <Controller
            name="is_anonymous"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.checked) {
                    toast.info("Your identity will be kept confidential");
                  } else {
                    toast.info("Your name will be visible");
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
              />
            )}
          />
          <div>
            <span className="font-medium text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Submit Anonymously
            </span>
            <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">
              Your identity will be hidden from public view. Officials can still
              access your info for processing.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
