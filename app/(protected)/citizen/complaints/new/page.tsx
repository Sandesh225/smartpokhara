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
import { Button } from "@/ui/button";
import { ArrowLeft, CheckCircle2, Home, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Skeleton } from "@/ui/skeleton";
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

  // Fetch initial data and check Auth
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Check Authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Redirect if not logged in
          toast.error("Authentication required", {
            description: "Please sign in to submit a complaint.",
          });
          router.push("/auth/signin?redirect=/citizen/complaints/new");
          return;
        }

        // 2. Fetch Data
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
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle form submission from child component
  const handleSubmitComplaint = async (
    formData: SubmitComplaintRequest,
    attachments: File[]
  ) => {
    try {
      setError(null);

      // 1. Submit Complaint Data
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

      // 3. Show Success State
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

      // We re-throw so the Form component knows to stop loading (though we handle UI here)
      // Actually, passing error back to form isn't necessary as we show Toast here.
      // But we must throw so form stops 'submitting' state if logic was different.
      // In this specific implementation, Form handles `finally`, so just showing Toast is enough.

      toast.error("Submission failed", {
        description: errorMessage,
      });

      // Re-throw to ensure form state updates
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
    window.location.reload(); // Simplest way to reset everything cleanly
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/citizen/complaints")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            Submit New Complaint
          </h1>
        </div>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Unable to Load Form</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/citizen/complaints")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Info className="h-4 w-4" />
            <span>
              Complaints are typically addressed within 3-7 working days
            </span>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Submit a New Complaint
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Help us improve our city by reporting issues that need attention.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Anonymous submissions allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Track progress in real-time</span>
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
          <Card className="border-blue-100 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Submit Complaint
                    </p>
                    <p className="text-sm text-slate-600">
                      Fill out details and location
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Auto-Assignment
                    </p>
                    <p className="text-sm text-slate-600">
                      System assigns to relevant department
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Track Progress</p>
                    <p className="text-sm text-slate-600">
                      Use tracking code to monitor status
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Complaint Submitted!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your complaint has been received. Please save your tracking code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {submissionResult && (
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-2">
                  Your Tracking Code
                </p>
                <div className="font-mono text-2xl font-bold text-slate-900 tracking-wider bg-white p-3 rounded border border-slate-200">
                  {submissionResult.tracking_code}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleSubmitAnother}
              className="sm:flex-1"
            >
              Submit Another
            </Button>
            <Button onClick={handleViewComplaint} className="sm:flex-1">
              View Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
