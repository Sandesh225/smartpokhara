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
  Home,
  Info,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
            duration: 4000,
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
        setError(err.message || "Failed to load form data. Please try again.");
        toast.error("Failed to load form data", {
          description: "Please refresh the page or try again later.",
          duration: 4000,
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

      const result = await complaintsService.submitComplaint(formData);

      if (attachments.length > 0) {
        const uploadPromises = attachments.map((file) =>
          complaintsService
            .uploadAttachment(result.complaint_id, file)
            .catch((err) => {
              console.error(`Failed to upload ${file.name}`, err);
              toast.warning(`Failed to upload ${file.name}`, {
                description: "The complaint was created, but this file failed.",
                duration: 3000,
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

      toast.success("Complaint submitted successfully!", {
        description: `Tracking Code: ${result.tracking_code}`,
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Error submitting complaint:", err);

      let errorMessage = "Failed to submit complaint. Please try again.";

      if (err.message?.includes("User profile not found")) {
        errorMessage =
          "Your user profile is incomplete. Please contact support.";
      } else if (err.message?.includes("category")) {
        errorMessage = "Please select a valid complaint category.";
      } else if (err.message?.includes("ward")) {
        errorMessage = "Please select a valid ward.";
      }

      toast.error("Submission failed", {
        description: errorMessage,
        duration: 4000,
      });

      throw err;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <Skeleton className="h-12 w-80 mb-3 bg-slate-200" />
            <Skeleton className="h-6 w-96 bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-2 border-slate-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 h-32">
                  <Skeleton className="h-8 w-48 mb-2 bg-slate-200" />
                  <Skeleton className="h-5 w-64 bg-slate-100" />
                </CardHeader>
                <CardContent className="space-y-4 pt-8">
                  <Skeleton className="h-12 w-full bg-slate-100" />
                  <Skeleton className="h-32 w-full bg-slate-100" />
                  <Skeleton className="h-12 w-full bg-slate-100" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-2 border-blue-200 shadow-xl">
                <CardHeader>
                  <Skeleton className="h-8 w-48 bg-blue-100" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-full mb-3 bg-slate-100" />
                  <Skeleton className="h-5 w-full bg-slate-100" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/citizen/complaints")}
              className="mb-4 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Submit New Complaint
            </h1>
          </div>
          <Alert className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
            <Info className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-900 font-bold text-lg">
              Unable to Load Form
            </AlertTitle>
            <AlertDescription className="text-red-800 mt-2 leading-relaxed">
              {error}
            </AlertDescription>
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="hover:bg-red-100 border-red-300 bg-white"
              >
                Retry
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/citizen/complaints")}
                className="hover:bg-red-100"
              >
                Go Back
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/citizen/complaints")}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Complaints</span>
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span>Home</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2.5 text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-slate-700 font-semibold">
                Typically resolved within 3-7 working days
              </span>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight">
              Submit a New Complaint
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Help us improve our city by reporting issues that need attention.
              Your voice matters.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-semibold">
                  Anonymous submissions allowed
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-semibold">
                  Track progress in real-time
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ComplaintForm
              categories={categories}
              wards={wards}
              onSubmit={handleSubmitComplaint}
            />
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border-b-2 border-blue-200">
                <CardTitle className="text-lg flex items-center gap-3 text-blue-900">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold">How It Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <ul className="space-y-5">
                  <li className="flex gap-4 group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      1
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-bold text-slate-900 mb-1.5 text-base">
                        Submit Complaint
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Fill out details and provide location information
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      2
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-bold text-slate-900 mb-1.5 text-base">
                        Auto-Assignment
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        System automatically assigns to relevant department
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      3
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-bold text-slate-900 mb-1.5 text-base">
                        Track Progress
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Use your tracking code to monitor status updates
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-lg border-2 border-green-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50 pointer-events-none" />
            <DialogHeader className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mx-auto mb-5 shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Complaint Submitted!
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 text-base leading-relaxed">
                Your complaint has been received. Please save your tracking code
                for future reference.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-6 relative">
              {submissionResult && (
                <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border-2 border-blue-300 text-center shadow-xl">
                  <p className="text-sm text-slate-600 mb-4 font-semibold uppercase tracking-wide">
                    Your Tracking Code
                  </p>
                  <div className="font-mono text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wider bg-white p-5 rounded-xl border-2 border-blue-300 shadow-inner">
                    {submissionResult.tracking_code}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Save this code to track your complaint status
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative">
              <Button
                variant="outline"
                onClick={handleSubmitAnother}
                className="sm:flex-1 hover:bg-slate-100 transition-colors border-2 border-slate-300 h-12 font-semibold"
              >
                Submit Another
              </Button>
              <Button
                onClick={handleViewComplaint}
                className="sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all h-12 font-semibold"
              >
                View Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}