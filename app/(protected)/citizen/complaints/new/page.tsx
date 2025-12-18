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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-10 space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Skeleton className="h-6 w-32 mx-auto rounded-full" />
              <Skeleton className="h-12 w-96 mx-auto rounded-lg" />
              <Skeleton className="h-5 w-full max-w-2xl mx-auto rounded-md" />
              <Skeleton className="h-5 w-full max-w-xl mx-auto rounded-md" />
              <div className="flex justify-center gap-4 mt-6">
                <Skeleton className="h-10 w-44 rounded-full" />
                <Skeleton className="h-10 w-44 rounded-full" />
              </div>
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[700px] w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-red-200 shadow-2xl bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-orange-500" />
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center mb-4 ring-4 ring-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
              Unable to Load Form
            </CardTitle>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
              {error}
            </p>
          </CardHeader>
          <CardContent className="pb-8 px-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/citizen/complaints")}
                className="flex-1 h-11 rounded-xl font-semibold border-slate-300 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-8 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-tl from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />

      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/citizen/complaints")}
              className="text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 transition-all rounded-full px-4 h-9 font-medium group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm ring-1 ring-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Citizen Service Portal
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              Submit a New Complaint
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
              Help us improve our city by reporting issues that need attention.
              We are committed to resolving your concerns swiftly and
              transparently.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full border border-green-200 shadow-sm ring-1 ring-green-50 hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-semibold text-slate-700">
                  Secure & Anonymous Option
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full border border-blue-200 shadow-sm ring-1 ring-blue-50 hover:shadow-md transition-shadow">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-700">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-slate-900/5 border border-white/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="p-6 md:p-8">
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
            <Card className="border-2 border-white/80 bg-gradient-to-br from-white/90 via-white/80 to-blue-50/30 backdrop-blur-md shadow-xl overflow-hidden ring-1 ring-slate-900/5 rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              {/* Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100/50">
                <CardTitle className="text-lg flex items-center gap-3 text-slate-900 font-bold">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200/50">
                    <Info className="h-5 w-5" />
                  </div>
                  <span>How It Works</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8 pt-8 pb-8 px-6">
                <div className="relative pl-8 border-l-2 border-blue-200/60 space-y-10">
                  {/* Step 1 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-200">
                      1
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                        Submit Details
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Provide accurate location and photos for faster
                        resolution. The more details you include, the better.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 border-4 border-white text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-200">
                      2
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                        Auto-Assignment
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Our system routes your request to the correct ward
                        officer instantly using smart assignment rules.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative group cursor-default">
                    <div className="absolute -left-[33px] h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-white text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-200">
                      3
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                        Resolution & Feedback
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Track status live through your dashboard. Rate our
                        service once your issue is resolved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Note */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mt-6">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-blue-700">Pro Tip:</span>{" "}
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
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
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