"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Schema and Types
import { formSchema, FormData } from "../../../../../components/citizen/complaints/schema";
import type {
  ComplaintCategory,
  Ward,
} from "@/lib/supabase/queries/complaints";

// Step Components
import { LocationStep } from "./form-steps/LocationStep";
import { DetailsStep } from "./form-steps/DetailsStep";
import { ReviewStep } from "./form-steps/ReviewStep";
import { CategoryStep } from "./form-steps/CategoryStep";

interface ComplaintFormProps {
  categories: ComplaintCategory[];
  wards: Ward[];
  onSubmit: (data: any, attachments: File[]) => Promise<void>;
}

const STEPS = [
  { id: 1, title: "Category", description: "Nature of issue" },
  { id: 2, title: "Location", description: "Where it happened" },
  { id: 3, title: "Details", description: "Evidence & context" },
  { id: 4, title: "Review", description: "Final check" },
];

export default function ComplaintForm({
  categories,
  wards,
  onSubmit,
}: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const nextStep = async () => {
    let fields: any = [];
    if (currentStep === 1) fields = ["category_id", "title"];
    if (currentStep === 2) fields = ["ward_id", "address_text"];
    if (currentStep === 3) fields = ["description"];

    const isValid = await methods.trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Required fields missing", {
        description: "Please complete the current section to proceed.",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (step: number) => {
    if (step < currentStep) setCurrentStep(step);
  };

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, source: "web" }, attachments);
    } catch (e: any) {
      toast.error("Submission failed", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className="w-full"
      >
        {/* Progress Stepper - Machhapuchhre Modern Style */}
        <div className="mb-12 hidden md:flex justify-between relative px-10">
          <div className="absolute top-[18px] left-10 right-10 h-1 bg-[rgb(var(--neutral-stone-200))] -z-10 rounded-full" />
          <motion.div
            className="absolute top-[18px] left-10 h-1 bg-[rgb(var(--primary-brand))] -z-10 rounded-full"
            initial={false}
            animate={{ width: `calc(${((currentStep - 1) / 3) * 100}% - 20px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          {STEPS.map((step) => {
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center group cursor-default">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? "rgb(var(--primary-brand))" : "rgb(255, 255, 255)",
                    borderColor: isActive ? "rgb(var(--primary-brand))" : "rgb(var(--neutral-stone-300))",
                    scale: isCurrent ? 1.2 : 1,
                  }}
                  className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all elevation-${isCurrent ? '3' : '1'}`}
                >
                  {isActive && !isCurrent ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <span className={isActive ? "text-white" : "text-[rgb(var(--neutral-stone-400))]"}>
                      {step.id}
                    </span>
                  )}
                </motion.div>
                <div className="mt-3 text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-[rgb(var(--primary-brand))]" : "text-[rgb(var(--neutral-stone-400))]"}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Container - Stone Card */}
        <div className="stone-card elevation-4 bg-white overflow-hidden border-none">
          <CardHeader className="card-padding border-b border-[rgb(var(--neutral-stone-100))] bg-[rgb(var(--neutral-stone-50))]/50">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-[rgb(var(--text-ink))]">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <p className="text-[rgb(var(--neutral-stone-500))] font-medium">
                  {currentStep === 1 && "Select a category and provide a brief title."}
                  {currentStep === 2 && "Pin the location or select your ward."}
                  {currentStep === 3 && "Add a description and upload supporting photos."}
                  {currentStep === 4 && "Check everything before sending to city hall."}
                </p>
              </div>
              <div className="glass px-4 py-2 rounded-xl border-[rgb(var(--primary-brand))]/10">
                <span className="text-sm font-bold text-[rgb(var(--primary-brand))]">
                  Step {currentStep} of 4
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="card-padding min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && <CategoryStep categories={categories} />}
                {currentStep === 2 && <LocationStep wards={wards} />}
                {currentStep === 3 && (
                  <DetailsStep
                    attachments={attachments}
                    setAttachments={setAttachments}
                    previews={previews}
                    setPreviews={setPreviews}
                  />
                )}
                {currentStep === 4 && (
                  <ReviewStep
                    categories={categories}
                    wards={wards}
                    previews={previews}
                    jumpToStep={jumpToStep}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Footer Navigation */}
          <div className="card-padding border-t border-[rgb(var(--neutral-stone-100))] flex justify-between items-center bg-[rgb(var(--neutral-stone-50))]/30">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-xl font-bold text-[rgb(var(--neutral-stone-600))] hover:bg-[rgb(var(--neutral-stone-100))]"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 rounded-xl bg-[rgb(var(--primary-brand))] hover:bg-[rgb(var(--primary-brand-light))] text-white font-bold elevation-2 transition-all hover:elevation-3"
                >
                  Next Step <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-10 rounded-xl bg-[rgb(var(--success-green))] hover:bg-[rgb(var(--success-green))]/90 text-white font-bold elevation-3 transition-all hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Report <CheckCircle2 className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Support Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[rgb(var(--neutral-stone-400))] text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent-nature))]" />
          Your IP and location are secured with end-to-end encryption.
        </div>
      </form>
    </FormProvider>
  );
}