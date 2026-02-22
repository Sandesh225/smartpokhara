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
  categories: { id: string; name: string; name_nepali?: string | null }[];
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
        { 
          label: "Category", 
          value: selectedCategory 
            ? `${selectedCategory.name} ${selectedCategory.name_nepali ? `(${selectedCategory.name_nepali})` : ""}`
            : "Not selected" 
        },
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
      <div className="space-y-1.5 pb-6 border-b border-border">
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Final Verification</h2>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          Verify logic vectors and operational data prior to transmission.
        </p>
      </div>

      {/* Review Sections */}
      <div className="grid gap-6">
        {sections.map((section) => ( section.items.some(i => i.value) && (
          <div
            key={section.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <button
                type="button"
                onClick={() => jumpToStep(section.step)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
              >
                <Edit2 className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="space-y-6">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="space-y-1.5"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground leading-relaxed">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )))}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Attached Records ({attachments.length})
              </h3>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
              >
                <Edit2 className="w-3 h-3" />
                Modify
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {previews.map((preview, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                  <img
                    src={preview}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Message */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-primary/20 bg-primary/5 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-card border border-primary/10 rounded-xl shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1.5 pt-0.5">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Operational Readiness</h4>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 max-w-md">
              Upon initializing transmission, this report will be encrypted and routed to the corresponding sector officer for immediate resolution protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="px-6 py-4 rounded-xl border border-dashed border-border bg-muted/10">
        <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest text-center leading-relaxed">
          Initialization implies confirmation of data accuracy and adherence to municipal reporting directives.
        </p>
      </div>
    </div>
  );
}