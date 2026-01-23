"use client";

import { useFormContext } from "react-hook-form";
import {
  Edit2,
  MapPin,
  FileText,
  Image,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type ReviewStepProps = {
  categories: { id: string; name: string }[];
  wards: { id: string; ward_number: number; name: string }[];
  previews: string[];
  attachments: File[];
  jumpToStep: (step: number) => void;
};

export function ReviewStep({
  categories,
  wards,
  previews,
  attachments,
  jumpToStep,
}: ReviewStepProps) {
  const { getValues } = useFormContext();
  const values = getValues();

  const selectedCategory = categories.find((c) => c.id === values.category_id);
  const selectedWard = wards.find((w) => w.id === values.ward_id);

  const sections = [
    {
      title: "Category & Title",
      step: 0,
      items: [
        { label: "Category", value: selectedCategory?.name || "Not selected" },
        { label: "Title", value: values.title || "Not provided" },
      ],
    },
    {
      title: "Location",
      step: 1,
      items: [
        {
          label: "Ward",
          value: selectedWard
            ? `Ward ${selectedWard.ward_number} - ${selectedWard.name}`
            : "Not selected",
        },
        { label: "Address", value: values.address_text || "Not provided" },
      ],
    },
    {
      title: "Details",
      step: 2,
      items: [
        { label: "Description", value: values.description || "Not provided" },
        {
          label: "Priority",
          value:
            values.priority?.charAt(0).toUpperCase() +
              values.priority?.slice(1) || "Medium",
        },
        { label: "Anonymous", value: values.is_anonymous ? "Yes" : "No" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-1">Review Your Complaint</h2>
        <p className="text-sm text-muted-foreground">
          Please verify all information before submitting
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-muted/30 rounded-lg p-4 border"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <button
                type="button"
                onClick={() => jumpToStep(section.step)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:items-start gap-1"
                >
                  <span className="text-xs font-medium text-muted-foreground w-28">
                    {item.label}:
                  </span>
                  <span className="text-sm flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Image className="w-4 h-4" />
                Attachments ({attachments.length})
              </h3>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {previews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-16 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Message */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Ready to Submit</h4>
            <p className="text-xs text-muted-foreground">
              Once submitted, your complaint will be assigned a tracking code
              and routed to the appropriate ward officer for review.
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
        <p className="text-xs text-muted-foreground">
          By submitting this complaint, you confirm that the information
          provided is accurate to the best of your knowledge.
        </p>
      </div>
    </div>
  );
}