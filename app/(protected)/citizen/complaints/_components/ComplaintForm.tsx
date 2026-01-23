"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Send, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  formSchema,
  FormData,
} from "../../../../../components/citizen/complaints/schema";
import type {
  ComplaintCategory,
  Ward,
} from "@/lib/supabase/queries/complaints";

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
    const isValid = await methods.trigger(fields);

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
        const valid = await methods.trigger(STEPS[i].fields);
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
    if (!isValid) {
      toast.error("Please complete all required fields");
      return;
    }

    const data = methods.getValues();
    setIsSubmitting(true);
    const submitToast = toast.loading("Submitting complaint...");

    try {
      await onSubmit({ ...data, source: "web" }, attachments);
      toast.success("Submitted successfully!", { id: submitToast });
    } catch (e: any) {
      toast.error(e.message || "Submission failed", { id: submitToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Progress Tracker */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onClick={() => jumpToStep(index)}
                >
                  <div className="relative flex items-center w-full">
                    {index !== 0 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          isActive ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors mx-2 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {isActive && !isCurrent ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                    {index !== STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          index < currentStep ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium mt-2 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </div>

          <button
            type="button"
            onClick={
              currentStep < STEPS.length - 1 ? nextStep : handleFormSubmit
            }
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : currentStep < STEPS.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}