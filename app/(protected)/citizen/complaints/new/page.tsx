"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Shield, Zap, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ChevronRight, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ComplaintForm from "@/app/(protected)/citizen/complaints/_components/ComplaintForm";

import { useCategories, useWards } from "@/features/complaints/hooks/useComplaintOptions";
import { useCreateComplaint } from "@/features/complaints/hooks/useComplaintMutations";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";

export default function NewComplaintPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    tracking_code: string;
    complaint_id: string;
  } | null>(null);

  // Hooks
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: wards = [], isLoading: isLoadingWards } = useWards();
  const { mutateAsync: createComplaint, isPending: isSubmitting } = useCreateComplaint();

  const isLoading = isLoadingUser || isLoadingCategories || isLoadingWards;

  useEffect(() => {
    if (!isLoadingUser && !user) {
      toast.error("Authentication required");
      router.push("/auth/signin?redirect=/citizen/complaints/new");
    }
  }, [user, isLoadingUser, router]);

  const handleSubmitComplaint = async (
    formData: any,
    attachments: File[]
  ) => {
    try {
      const result = await createComplaint({
        ...formData,
        media: attachments, // Pass files to mutation which handles upload
      });

      setSubmissionResult({
        tracking_code: result.tracking_code,
        complaint_id: result.complaint_id,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      // Error handled by mutation onError
      throw err;
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

  if (!user) return null; // Handled by useEffect redirect

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