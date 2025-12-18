"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Smile,
  Frown,
  Meh,
  Clock,
  Badge,
} from "lucide-react";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Swapped to Sonner

interface FeedbackFormProps {
  complaintId: string;
  complaintStatus: string;
  onSubmitSuccess?: () => void;
}

const feedbackSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating" }).max(5),
  satisfaction: z.enum([
    "very_satisfied",
    "satisfied",
    "neutral",
    "dissatisfied",
    "very_dissatisfied",
  ]),
  issue_fully_resolved: z.enum(["yes", "no"]),
  would_recommend: z.enum(["yes", "no"]),
  feedback_text: z
    .string()
    .max(1000, { message: "Feedback is too long (max 1000 characters)" })
    .optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const RATING_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Poor", color: "text-red-500" },
  2: { label: "Fair", color: "text-orange-500" },
  3: { label: "Good", color: "text-yellow-500" },
  4: { label: "Very Good", color: "text-lime-500" },
  5: { label: "Excellent", color: "text-green-500" },
};

export function FeedbackForm({
  complaintId,
  complaintStatus,
  onSubmitSuccess,
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    mode: "onChange",
    defaultValues: {
      rating: 0,
      satisfaction: "neutral",
      issue_fully_resolved: "yes",
      would_recommend: "yes",
      feedback_text: "",
    },
  });

  const rating = watch("rating");
  const satisfaction = watch("satisfaction");
  const issueResolved = watch("issue_fully_resolved");
  const wouldRecommend = watch("would_recommend");
  const feedbackText = watch("feedback_text");

  // Show placeholder for unresolved complaints
  if (complaintStatus !== "resolved" && complaintStatus !== "closed") {
    return (
      <Card className="border-slate-200 bg-slate-50/50 shadow-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-slate-400">Feedback</CardTitle>
          <CardDescription>Available after resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 opacity-60">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              You can rate our service once the complaint is resolved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: FeedbackFormData) => {
    if (!complaintId) return;

    setIsSubmitting(true);

    // Using Sonner toast.promise for the premium SaaS experience
    toast.promise(
      complaintsService.submitFeedback(complaintId, {
        rating: data.rating,
        issue_resolved: data.issue_fully_resolved === "yes",
        would_recommend: data.would_recommend === "yes",
        feedback_text: data.feedback_text || undefined,
      }),
      {
        loading: "Saving your feedback...",
        success: () => {
          setIsSubmitted(true);
          if (onSubmitSuccess) onSubmitSuccess();
          return "Thank you! Your feedback has been recorded.";
        },
        error: (err) => {
          setIsSubmitting(false);
          return err.message || "Failed to submit feedback. Please try again.";
        },
      }
    );
  };

  const handleRatingClick = (value: number) => {
    setValue("rating", value, { shouldValidate: true, shouldDirty: true });
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50 shadow-lg shadow-green-900/5">
        <CardContent className="pt-8">
          <div className="text-center py-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-white border border-green-100 flex items-center justify-center mb-6 animate-in zoom-in duration-500 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              Thank You!
            </h3>
            <p className="text-green-700 max-w-xs mx-auto text-sm leading-relaxed">
              Your feedback helps us provide better digital services for
              Pokhara.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden ring-1 ring-slate-900/5">
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Rate Service Quality
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Your honest feedback helps improve our city.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 1. Overall Rating */}
          <div className="space-y-5">
            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
              1. Overall Experience <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col items-center gap-5 p-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 transition-colors hover:border-blue-200">
              <div className="flex gap-1" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={isSubmitting}
                      className="p-1 focus:outline-none transition-all hover:scale-125 active:scale-95 disabled:opacity-50"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={cn(
                          "h-12 w-12 transition-all duration-300",
                          isFilled
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "text-slate-200 fill-slate-50"
                        )}
                        strokeWidth={1.5}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="h-8">
                {(hoverRating || rating) > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-4 py-1 text-sm font-bold animate-in zoom-in duration-300 border-2",
                      RATING_MAP[hoverRating || rating]?.color,
                      "bg-white shadow-sm"
                    )}
                  >
                    {RATING_MAP[hoverRating || rating]?.label}
                  </Badge>
                )}
              </div>
              {errors.rating && (
                <p className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {errors.rating.message}
                </p>
              )}
            </div>
          </div>

          {/* Progressive Disclosure */}
          {rating > 0 && (
            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 fade-in">
              <Separator className="bg-slate-100" />

              {/* 2. Satisfaction */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  2. Resolution Satisfaction
                </Label>
                <RadioGroup
                  value={satisfaction}
                  onValueChange={(val) => setValue("satisfaction", val as any)}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                >
                  <SatisfactionOption
                    value="very_satisfied"
                    label="Excellent"
                    icon={Smile}
                    color="text-green-500"
                    current={satisfaction}
                  />
                  <SatisfactionOption
                    value="satisfied"
                    label="Good"
                    icon={Smile}
                    color="text-lime-500"
                    current={satisfaction}
                  />
                  <SatisfactionOption
                    value="neutral"
                    label="Neutral"
                    icon={Meh}
                    color="text-amber-500"
                    current={satisfaction}
                  />
                  <SatisfactionOption
                    value="dissatisfied"
                    label="Poor"
                    icon={Frown}
                    color="text-orange-500"
                    current={satisfaction}
                  />
                  <SatisfactionOption
                    value="very_dissatisfied"
                    label="Bad"
                    icon={Frown}
                    color="text-red-500"
                    current={satisfaction}
                  />
                </RadioGroup>
              </div>

              {/* 3. Yes/No Binary Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Issue Resolved?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <BinaryOption
                      label="Yes"
                      selected={issueResolved === "yes"}
                      onClick={() => setValue("issue_fully_resolved", "yes")}
                      type="success"
                    />
                    <BinaryOption
                      label="No"
                      selected={issueResolved === "no"}
                      onClick={() => setValue("issue_fully_resolved", "no")}
                      type="danger"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Would Recommend?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <BinaryOption
                      label="Yes"
                      selected={wouldRecommend === "yes"}
                      onClick={() => setValue("would_recommend", "yes")}
                      type="success"
                    />
                    <BinaryOption
                      label="No"
                      selected={wouldRecommend === "no"}
                      onClick={() => setValue("would_recommend", "no")}
                      type="danger"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Detailed Feedback */}
              <div className="space-y-4">
                <Label
                  htmlFor="feedback_text"
                  className="text-sm font-bold uppercase tracking-wider text-slate-500 flex justify-between"
                >
                  <span>3. Detailed Feedback</span>
                  <span className="text-slate-400 font-normal lowercase italic">
                    (Optional)
                  </span>
                </Label>
                <div className="relative group">
                  <Textarea
                    id="feedback_text"
                    placeholder={
                      rating <= 3
                        ? "How can we improve our resolution process?"
                        : "Share what you liked most about the service..."
                    }
                    className="min-h-[120px] rounded-xl border-2 bg-slate-50 focus:bg-white focus:ring-blue-500/20 transition-all resize-none p-4"
                    {...register("feedback_text")}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400">
                    {feedbackText?.length || 0}/1000
                  </div>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full sm:w-auto min-w-[240px] h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 border-0"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-3" /> Submit Feedback
                    </>
                  )}
                </Button>
                <p className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  Responses are processed by Pokhara IT Team to improve public
                  services.
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// Visual Sub-components
function SatisfactionOption({ value, label, icon: Icon, color, current }: any) {
  const isSelected = current === value;
  return (
    <div className="relative">
      <RadioGroupItem
        value={value}
        id={`sat-${value}`}
        className="peer sr-only"
      />
      <Label
        htmlFor={`sat-${value}`}
        className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all h-full text-center group",
          isSelected
            ? "bg-blue-50 border-blue-600 ring-4 ring-blue-100 shadow-md"
            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6 transition-transform group-hover:scale-110",
            isSelected ? color : "text-slate-300"
          )}
        />
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-tight",
            isSelected ? "text-blue-900" : "text-slate-500"
          )}
        >
          {label}
        </span>
      </Label>
    </div>
  );
}

function BinaryOption({ label, selected, onClick, type }: any) {
  const activeClass =
    type === "success"
      ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200"
      : "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer font-bold transition-all active:scale-95",
        selected
          ? activeClass
          : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-600"
      )}
    >
      {type === "success" ? (
        <ThumbsUp className={cn("h-4 w-4", selected && "fill-current")} />
      ) : (
        <ThumbsDown className={cn("h-4 w-4", selected && "fill-current")} />
      )}
      {label}
    </div>
  );
}
