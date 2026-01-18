"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Send, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Schema and Types
import { formSchema, FormData } from "../../../../../components/citizen/complaints/schema";
import type {
  ComplaintCategory,
  Ward,
} from "@/lib/supabase/queries/complaints";

// Step Components
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
  { id: 0, label: "Category", desc: "Type of issue" },
  { id: 1, label: "Location", desc: "Where is it" },
  { id: 2, label: "Details", desc: "More info" },
  { id: 3, label: "Review", desc: "Final check" }
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

  const nextStep = async () => {
    let fields: any = [];
    if (currentStep === 0) fields = ["category_id", "title"];
    if (currentStep === 1) fields = ["ward_id", "address_text"];
    if (currentStep === 2) fields = ["description"];

    const isValid = await methods.trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(`Step ${currentStep + 1} completed`);
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      toast.info(`Jumped to ${STEPS[step].label}`);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await methods.trigger();
    if (!isValid) {
      toast.error("Please complete all required fields");
      return;
    }

    const data = methods.getValues();
    setIsSubmitting(true);
    
    const submitToast = toast.loading("Submitting your report...");
    
    try {
      await onSubmit({ ...data, source: "web" }, attachments);
      toast.success("Report submitted successfully!", { id: submitToast });
    } catch (e: any) {
      toast.error(e.message || "Submission failed", { id: submitToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Submit Complaint
            </h1>
            <p className="text-muted-foreground">
              Report civic issues to your local government
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
              <motion.div 
                className="absolute top-5 left-0 h-0.5 bg-primary -z-10"
                initial={false}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
              
              {STEPS.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{ 
                        scale: isCurrent ? 1.1 : 1,
                        backgroundColor: isActive 
                          ? "hsl(var(--primary))" 
                          : "hsl(var(--background))"
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive 
                          ? "border-primary shadow-md" 
                          : "border-border"
                      }`}
                    >
                      {isActive && !isCurrent ? (
                        <Check className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <span className={`font-semibold text-sm ${
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                    <div className="mt-2 text-center hidden sm:block">
                      <p className={`text-xs font-semibold ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            
            {/* Content Area */}
            <div className="p-6 md:p-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
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
                      jumpToStep={jumpToStep}
                      attachments={attachments}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="bg-muted/30 border-t border-border px-6 md:px-8 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="text-xs text-muted-foreground sm:hidden">
                Step {currentStep + 1} of {STEPS.length}
              </div>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            🔒 Your information is secure and will be reviewed by government officials
          </p>
        </div>
      </div>
    </FormProvider>
  );
}