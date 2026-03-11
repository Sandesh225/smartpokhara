"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  complaintSchema as formSchema,
  ComplaintFormData as FormData,
  Complaint,
  ComplaintCategory,
  Ward,
} from "@/features/complaints";

import { CategoryStep } from "./form-steps/CategoryStep";
import { LocationStep } from "./form-steps/LocationStep";
import { DetailsStep } from "./form-steps/DetailsStep";
import { ReviewStep } from "./form-steps/ReviewStep";

interface ComplaintFormProps {
  categories: ComplaintCategory[];
  wards: Ward[];
  onSubmit: (data: any, attachments: File[]) => Promise<void>;
}

const STEPS = [
  { id: 0, label: "Category", fields: ["category_id", "title"] },
  { id: 1, label: "Location", fields: ["ward_id", "address_text"] },
  { id: 2, label: "Details", fields: ["description"] },
  { id: 3, label: "Review", fields: [] },
];

export default function ComplaintForm({
  categories,
  wards,
  onSubmit,
}: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "medium",
      is_anonymous: false,
      location_point: null,
      description: "",
      category_id: "",
      title: "",
      ward_id: "",
      address_text: "",
    },
    mode: "onChange",
  });

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const nextStep = async () => {
    const fields = STEPS[currentStep].fields;
    const isValid = await methods.trigger(fields as any);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = async (step: number) => {
    if (step === currentStep) return;

    if (step > currentStep) {
      for (let i = currentStep; i < step; i++) {
        const valid = await methods.trigger(STEPS[i].fields as any);
        if (!valid) {
          toast.error("Complete previous steps first");
          return;
        }
      }
    }

    setCurrentStep(step);
  };

  const handleFormSubmit = async () => {
    const isValid = await methods.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Sending your complaint...");

    const data = methods.getValues();

    if (data.location_point) {
      console.log("📍 Sending GPS:", data.location_point.coordinates);
    }

    try {
      await onSubmit({ ...data, source: "web" }, attachments);

      toast.success("Complaint sent successfully!", {
        id: toastId,
        description: "You can check its status in your dashboard.",
        duration: 5000,
      });
    } catch (e: any) {
      console.error("Submission failed:", e);
      
      toast.error("Failed to send complaint", {
        id: toastId,
        description: e.message || "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-10">
        {/* Progress Tracker */}
        <div className="relative px-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1 z-10">
                  <div className="relative flex items-center justify-center w-full">
                    {/* Progress Line */}
                    {index !== 0 && (
                      <div
                        className={cn(
                          "absolute right-1/2 left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-300",
                          isActive ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}
                    {index !== STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-300",
                          index < currentStep ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => jumpToStep(index)}
                      className={cn(
                        "relative w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-200 z-10 active:scale-[0.95]",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {isActive && !isCurrent ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <span className="text-xs font-bold">
                          {index + 1}
                        </span>
                      )}
                      {isCurrent && (
                        <div className="absolute -inset-2 border-2 border-primary/20 rounded-2xl animate-fade-in" />
                      )}
                    </button>
                  </div>
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider mt-3 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground/40"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] animate-fade-in" key={currentStep}>
          {currentStep === 0 && <CategoryStep categories={categories} />}
          {currentStep === 1 && <LocationStep wards={wards} />}
          {currentStep === 2 && (
            <DetailsStep
              attachments={attachments}
              setAttachments={setAttachments}
              previews={previews}
              setPreviews={setPreviews}
            />
          )}
          {currentStep === 3 && (
            <ReviewStep
              categories={categories}
              wards={wards}
              previews={previews}
              attachments={attachments}
              jumpToStep={jumpToStep}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="inline-flex items-center gap-2.5 px-5 h-11 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] border border-border"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="hidden sm:block">
            <p className="text-xs font-medium text-muted-foreground/40 uppercase tracking-wider">
              Step {currentStep + 1} / {STEPS.length}
            </p>
          </div>

          <button
            type="button"
            onClick={currentStep < STEPS.length - 1 ? nextStep : handleFormSubmit}
            disabled={isSubmitting}
            className={cn(
              "inline-flex items-center gap-2.5 px-6 h-11 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm",
              isSubmitting
                ? "bg-muted text-muted-foreground/40"
                : "bg-primary text-primary-foreground hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : currentStep < STEPS.length - 1 ? (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Send Complaint
                <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}