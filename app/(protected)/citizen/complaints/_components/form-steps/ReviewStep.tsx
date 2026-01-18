"use client";

import { useFormContext } from "react-hook-form";
import {
  MapPin,
  FileText,
  CheckCircle2,
  Edit2,
  Grid3x3,
  MessageSquare,
  Image,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ReviewStep({
  categories,
  wards,
  previews,
  jumpToStep,
  attachments,
}: any) {
  const { getValues } = useFormContext();
  const values = getValues();

  const categoryName = categories.find(
    (c: any) => c.id === values.category_id
  )?.name;
  const wardNumber = wards.find(
    (w: any) => w.id === values.ward_id
  )?.ward_number;
  const wardName = wards.find((w: any) => w.id === values.ward_id)?.name;

  const handleEdit = (step: number, label: string) => {
    jumpToStep(step);
    toast.info(`Editing ${label}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Review Your Complaint
        </h2>
        <p className="text-sm text-muted-foreground">
          Please verify all information before submitting
        </p>
      </div>

      {/* Ready Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-primary/10 border border-primary/30 p-4 rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              Ready to Submit
            </h3>
            <p className="text-xs text-muted-foreground">
              Review the details below and click submit when ready
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category & Title */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Issue Details
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleEdit(0, "Category")}
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium px-2 py-1 rounded hover:bg-accent transition-colors"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Category</p>
            <p className="font-medium text-sm text-foreground">
              {categoryName || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Title</p>
            <p className="font-medium text-sm text-foreground">
              {values.title || "Not provided"}
            </p>
          </div>
          {values.subcategory_id && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Subcategory
              </p>
              <p className="text-sm text-foreground">{values.subcategory_id}</p>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Location</h3>
          </div>
          <button
            type="button"
            onClick={() => handleEdit(1, "Location")}
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium px-2 py-1 rounded hover:bg-accent transition-colors"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Ward</p>
            <p className="font-medium text-sm text-foreground">
              Ward {wardNumber || "Not selected"}{" "}
              {wardName ? `- ${wardName}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Address</p>
            <p className="text-sm text-foreground leading-relaxed">
              {values.address_text || "Not provided"}
            </p>
          </div>
          {values.landmark && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Landmark</p>
              <p className="text-sm text-foreground">{values.landmark}</p>
            </div>
          )}
          {values.location_point && (
            <div className="bg-primary/5 border border-primary/20 p-2 rounded-sm mt-2">
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> GPS coordinates captured
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description & Media */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Description & Media
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleEdit(2, "Details")}
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium px-2 py-1 rounded hover:bg-accent transition-colors"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-sm border border-border">
              {values.description || "Not provided"}
            </p>
          </div>

          {previews.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Image className="h-3.5 w-3.5" />
                Attached Photos ({previews.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {previews.slice(0, 4).map((preview: string, i: number) => (
                  <div
                    key={i}
                    className="aspect-square rounded-sm overflow-hidden border border-border"
                  >
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {previews.length > 4 && (
                  <div className="aspect-square rounded-sm bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    +{previews.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {values.is_anonymous && (
            <div className="bg-primary/5 border border-primary/20 p-2.5 rounded-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs font-medium text-foreground">
                Submitting anonymously
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Note */}
      <div className="bg-muted/50 border border-border p-3 rounded-md">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By submitting this complaint, you confirm that all information
          provided is accurate. Government officials will review and process
          your report.
        </p>
      </div>
    </div>
  );
}
