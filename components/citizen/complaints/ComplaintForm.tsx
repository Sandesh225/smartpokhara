"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Schema and Types
import { formSchema, FormData } from "./schema";
import type {
  ComplaintCategory,
  Ward,
} from "@/lib/supabase/queries/complaints";

// Steps
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
  { id: 1, title: "Category" },
  { id: 2, title: "Location" },
  { id: 3, title: "Details" },
  { id: 4, title: "Review" },
];

export default function ComplaintForm({
  categories,
  wards,
  onSubmit,
}: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File state is lifted here to share between DetailsStep (upload) and ReviewStep (view)
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

    // Validate current step fields
    const isValid = await methods.trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields to proceed.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (step: number) => {
    // Only allow jumping back, or jumping forward if the current step is valid?
    // Usually jumping back is safe.
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // We pass the raw data + the file array to the parent handler
      await onSubmit({ ...data, source: "web" }, attachments);
      toast.success("Complaint filed successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Progress Stepper */}
        <div className="mb-8 hidden sm:flex justify-between relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
          {STEPS.map((step) => {
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 bg-slate-50 px-2"
              >
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? "#2563eb" : "#e2e8f0",
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                >
                  {isActive ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </motion.div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-blue-600" : "text-slate-400"}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <Card className="shadow-xl border-slate-200 overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8">
            <CardTitle className="text-2xl font-black text-slate-800">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <p className="text-slate-500 font-medium">
              {currentStep === 1 && "What kind of issue are you reporting?"}
              {currentStep === 2 && "Where is the problem located?"}
              {currentStep === 3 && "Tell us more about what happened."}
              {currentStep === 4 && "Review your details before submitting."}
            </p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 min-h-[400px]">
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
          </CardContent>

          <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl border-2 font-bold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <div /> // Spacer
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-10 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Complaint <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </FormProvider>
  );
}