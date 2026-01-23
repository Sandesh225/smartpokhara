"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  complaintsService,
  type SubmitComplaintRequest,
  type ComplaintCategory,
  type Ward,
} from "@/lib/supabase/queries/complaints";
import ComplaintForm from "@/app/(protected)/citizen/complaints/_components/ComplaintForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  ChevronRight,
  Loader2,
  MapPin,
  FileText,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Authentication required");
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
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitComplaint = async (
    formData: SubmitComplaintRequest,
    attachments: File[]
  ) => {
    try {
      const result = await complaintsService.submitComplaint(formData);

      if (attachments.length > 0) {
        const uploadPromises = attachments.map((file) =>
          complaintsService.uploadAttachment(result.complaint_id, file)
        );
        await Promise.all(uploadPromises);
      }

      setSubmissionResult({
        tracking_code: result.tracking_code,
        complaint_id: result.complaint_id,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      throw new Error(err.message || "Submission failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-semibold text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Submit New Complaint</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" /> Quick Response
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" /> Secure & Confidential
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/citizen/complaints")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Complaint Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide detailed information for faster resolution
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ComplaintForm
                categories={categories}
                wards={wards}
                onSubmit={handleSubmitComplaint}
              />
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <aside className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Instant Registration",
                  desc: "Your complaint is logged immediately with a unique tracking ID",
                  icon: Zap,
                },
                {
                  title: "Smart Routing",
                  desc: "Automatically assigned to the appropriate ward officer",
                  icon: MapPin,
                },
                {
                  title: "Real-time Updates",
                  desc: "Receive notifications as your complaint is processed",
                  icon: Clock,
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  💡 Pro Tip:
                </span>{" "}
                Complaints with clear photos and precise locations are resolved{" "}
                <span className="font-semibold text-primary">40% faster</span>
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>

            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">
                Complaint Submitted
              </DialogTitle>
              <DialogDescription>
                Your complaint has been successfully registered
              </DialogDescription>
            </DialogHeader>

            {submissionResult && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Tracking Code
                </span>
                <div className="text-2xl font-mono font-bold text-primary">
                  {submissionResult.tracking_code}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() =>
                  router.push(
                    `/citizen/complaints/${submissionResult?.complaint_id}`
                  )
                }
                className="w-full gap-2"
              >
                Track Status
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Submit Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}