"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  complaintsService,
  type SubmitComplaintRequest,
  type ComplaintCategory,
  type Ward,
} from "@/lib/supabase/queries/complaints";
import ComplaintForm from "@/components/citizen/complaints/ComplaintForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  Info,
  Shield,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewComplaintPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    tracking_code: string;
    complaint_id: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Authentication required", {
            description: "Please sign in to submit a complaint.",
          });
          router.push("/auth/signin?redirect=/citizen/complaints/new");
          return;
        }

        const [categoriesData, wardsData] = await Promise.all([
          complaintsService.getCategories(),
          complaintsService.getWards(),
        ]);

        setCategories(categoriesData);
        setWards(wardsData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load form data.");
        toast.error("Network Error", {
          description: "Failed to load form configuration.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmitComplaint = async (
    formData: SubmitComplaintRequest,
    attachments: File[]
  ) => {
    try {
      setError(null);

      // 1. Submit Data
      const result = await complaintsService.submitComplaint(formData);

      // 2. Upload Attachments (Parallel)
      if (attachments.length > 0) {
        const uploadPromises = attachments.map((file) =>
          complaintsService
            .uploadAttachment(result.complaint_id, file)
            .catch((err) => {
              console.error(`Failed to upload ${file.name}`, err);
              toast.warning(`Failed to upload ${file.name}`, {
                description: "The complaint was created, but this file failed.",
              });
            })
        );
        await Promise.all(uploadPromises);
      }

      setSubmissionResult({
        tracking_code: result.tracking_code,
        complaint_id: result.complaint_id,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error submitting complaint:", err);
      let errorMessage = "Failed to submit complaint. Please try again.";

      if (err.message?.includes("User profile not found")) {
        errorMessage =
          "Your user profile is incomplete. Please contact support.";
      }

      // Re-throw to let form handle loading state reset
      throw new Error(errorMessage);
    }
  };

  const handleViewComplaint = () => {
    if (submissionResult) {
      router.push(`/citizen/complaints/${submissionResult.complaint_id}`);
    }
    setShowSuccessModal(false);
  };

  const handleSubmitAnother = () => {
    setShowSuccessModal(false);
    setSubmissionResult(null);
    window.location.reload();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--neutral-stone))] section-spacing container-padding">
        <div className="container mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-10 space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Skeleton className="h-6 w-32 mx-auto rounded-full" />
              <Skeleton className="h-14 w-96 mx-auto rounded-lg" />
              <Skeleton className="h-5 w-full max-w-2xl mx-auto rounded-md" />
              <Skeleton className="h-5 w-full max-w-xl mx-auto rounded-md" />
              <div className="flex justify-center gap-4 mt-6">
                <Skeleton className="h-12 w-48 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[700px] w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[450px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(var(--neutral-stone))] flex items-center justify-center container-padding">
        <Card className="max-w-lg w-full border-2 border-[rgb(var(--error-red))]/20 elevation-4 bg-white overflow-hidden rounded-3xl">
          <div className="h-2 w-full bg-[rgb(var(--error-red))]" />
          <CardHeader className="text-center pb-4 pt-10 card-padding">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-4 ring-red-100">
              <AlertCircle className="h-8 w-8 text-[rgb(var(--error-red))]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[rgb(var(--text-ink))] mb-2">
              Unable to Load Form
            </CardTitle>
            <p className="text-[rgb(var(--neutral-stone-500))] text-sm leading-relaxed max-w-md mx-auto">
              {error}
            </p>
          </CardHeader>
          <CardContent className="pb-8 px-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/citizen/complaints")}
                className="flex-1 h-12 rounded-xl font-semibold border-2 border-[rgb(var(--neutral-stone-300))] hover:bg-[rgb(var(--neutral-stone-50))] transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 h-12 rounded-xl bg-[rgb(var(--error-red))] hover:bg-[rgb(var(--error-red))]/90 text-white font-semibold elevation-3 transition-all hover:elevation-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Content
  return (
    <div className="min-h-screen bg-[rgb(var(--neutral-stone))] section-spacing container-padding relative overflow-hidden">
      {/* Decorative Background Elements with Lakeside Teal */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[rgb(var(--primary-brand))]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[700px] h-[700px] bg-[rgb(var(--accent-nature))]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/citizen/complaints")}
              className="text-[rgb(var(--neutral-stone-600))] hover:text-[rgb(var(--primary-brand))] hover:bg-[rgb(var(--primary-brand))]/5 transition-all rounded-full px-4 h-10 font-medium group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--accent-nature))]/10 border-2 border-[rgb(var(--accent-nature))]/20 text-[rgb(var(--accent-nature-dark))] text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Citizen Service Portal
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[rgb(var(--text-ink))] mb-6 tracking-tight leading-tight">
              Submit a New Complaint
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-[rgb(var(--neutral-stone-600))] mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
              Help us improve our city by reporting issues that need attention.
              We are committed to resolving your concerns swiftly and
              transparently.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2 glass-strong px-4 py-3 rounded-full border-2 border-[rgb(var(--success-green))]/20 elevation-2">
                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[rgb(var(--success-green))]" />
                </div>
                <span className="font-semibold text-[rgb(var(--text-ink))]">
                  Secure & Anonymous Option
                </span>
              </div>
              <div className="flex items-center gap-2 glass-strong px-4 py-3 rounded-full border-2 border-[rgb(var(--primary-brand))]/20 elevation-2">
                <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary-brand))]/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-[rgb(var(--primary-brand))]" />
                </div>
                <span className="font-semibold text-[rgb(var(--text-ink))]">
                  24-48h Response Time
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="stone-card elevation-4 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[rgb(var(--primary-brand))] via-[rgb(var(--accent-nature))] to-[rgb(var(--primary-brand))]" />
              <div className="card-padding">
                <ComplaintForm
                  categories={categories}
                  wards={wards}
                  onSubmit={handleSubmitComplaint}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-6 duration-700 delay-150">
            <Card className="stone-card elevation-4 overflow-hidden">
              {/* Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-[rgb(var(--primary-brand))] via-[rgb(var(--accent-nature))] to-[rgb(var(--primary-brand))]" />

              <CardHeader className="pb-4 pt-6 card-padding border-b border-[rgb(var(--neutral-stone-200))]">
                <CardTitle className="text-lg flex items-center gap-3 text-[rgb(var(--text-ink))] font-bold">
                  <div className="h-11 w-11 rounded-xl bg-[rgb(var(--primary-brand))] text-white flex items-center justify-center elevation-2">
                    <Info className="h-5 w-5" />
                  </div>
                  <span>How It Works</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8 pt-8 pb-8 card-padding">
                <div className="relative pl-8 border-l-2 border-[rgb(var(--accent-nature))]/30 space-y-10">
                  {/* Step 1 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-[rgb(var(--primary-brand))] border-4 border-white text-white flex items-center justify-center text-sm font-bold elevation-2 group-hover:elevation-3 transition-all">
                      1
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-[rgb(var(--text-ink))] text-sm group-hover:text-[rgb(var(--primary-brand))] transition-colors">
                        Submit Details
                      </h4>
                      <p className="text-xs text-[rgb(var(--neutral-stone-600))] leading-relaxed">
                        Provide accurate location and photos for faster
                        resolution. The more details you include, the better.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-[rgb(var(--accent-nature))] border-4 border-white text-white flex items-center justify-center text-sm font-bold elevation-2 group-hover:elevation-3 transition-all">
                      2
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-[rgb(var(--text-ink))] text-sm group-hover:text-[rgb(var(--accent-nature))] transition-colors">
                        Auto-Assignment
                      </h4>
                      <p className="text-xs text-[rgb(var(--neutral-stone-600))] leading-relaxed">
                        Our system routes your request to the correct ward
                        officer instantly using smart assignment rules.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-[rgb(var(--success-green))] border-4 border-white text-white flex items-center justify-center text-sm font-bold elevation-2 group-hover:elevation-3 transition-all">
                      3
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-[rgb(var(--text-ink))] text-sm group-hover:text-[rgb(var(--success-green))] transition-colors">
                        Resolution & Feedback
                      </h4>
                      <p className="text-xs text-[rgb(var(--neutral-stone-600))] leading-relaxed">
                        Track status live through your dashboard. Rate our
                        service once your issue is resolved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Note */}
                <div className="bg-[rgb(var(--primary-brand))]/5 border-2 border-[rgb(var(--primary-brand))]/10 rounded-xl p-4 mt-6">
                  <p className="text-xs text-[rgb(var(--text-ink))] leading-relaxed">
                    <span className="font-bold text-[rgb(var(--primary-brand))]">
                      Pro Tip:
                    </span>{" "}
                    Include photos and exact location for priority handling.
                    Anonymous complaints are also supported.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-lg border-0 bg-white shadow-2xl p-0 overflow-hidden rounded-3xl">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/60 to-teal-50/40 opacity-100 z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center pt-12 pb-10 px-8 text-center">
              {/* Success Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative h-24 w-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-300/50 animate-in zoom-in duration-500 ring-4 ring-white">
                  <CheckCircle2
                    className="h-14 w-14 text-white"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Header */}
              <DialogHeader className="space-y-3 mb-2">
                <DialogTitle className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Complaint Submitted!
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-base leading-relaxed max-w-sm mx-auto">
                  We have received your report. A tracking code has been
                  generated for your reference.
                </DialogDescription>
              </DialogHeader>

              {/* Tracking Code Display */}
              {submissionResult && (
                <div className="mt-8 mb-8 w-full">
                  <div className="bg-white/90 backdrop-blur-sm border-2 border-green-200 rounded-2xl p-6 shadow-lg ring-4 ring-green-50 hover:shadow-xl transition-shadow">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-green-500" />
                      Tracking Code
                      <div className="h-1 w-1 rounded-full bg-green-500" />
                    </p>
                    <div className="text-3xl md:text-4xl font-mono font-extrabold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text tracking-wider select-all cursor-pointer hover:scale-105 transition-transform">
                      {submissionResult.tracking_code}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                      Click to copy • Save this for tracking
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handleSubmitAnother}
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] bg-transparent"
                >
                  Submit Another
                </Button>
                <Button
                  onClick={handleViewComplaint}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-300/50 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                >
                  Track Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
