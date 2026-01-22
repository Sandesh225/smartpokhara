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
  Sparkles,
  Clock,
  Info,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Loader2,
  MapPin,
  FileText,
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

      const { data: { session } } = await supabase.auth.getSession();

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <Loader2 className="w-14 h-14 animate-spin text-primary" />
        <p className="font-black text-lg tracking-tight">Preparing Report Form</p>
        <Badge variant="outline" className="tracking-widest uppercase text-xs border-primary/30">
          Pokhara Citizen Portal
        </Badge>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background">
        <Card className="max-w-md w-full border-destructive/20 shadow-2xl bg-card">
          <div className="h-1.5 w-full bg-destructive" />
          <CardContent className="pt-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Initialization Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground rounded-xl" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground space-y-8 pb-12 px-4 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <header className="border-b border-border pb-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-primary-brand-dark dark:text-foreground">
                Submit New Complaint
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 font-bold">
                <Sparkles className="w-3 h-3 mr-1" /> Pokhara Metro
              </Badge>
              <Badge variant="outline" className="font-medium text-muted-foreground border-border">
                <ShieldCheck className="w-3 h-3 mr-1" /> Secure Official Registry
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/citizen/complaints")}
            className="group hover:bg-muted rounded-xl font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORM SIDE */}
        <div className="lg:col-span-2">
          <Card className="stone-card overflow-hidden border-border bg-card shadow-md">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary-brand-light" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black text-foreground">Issue Details</CardTitle>
              <p className="text-sm text-muted-foreground">Provide as much detail as possible for faster resolution.</p>
            </CardHeader>
            <CardContent className="pt-4">
              <ComplaintForm
                categories={categories}
                wards={wards}
                onSubmit={handleSubmitComplaint}
              />
            </CardContent>
          </Card>
        </div>

        {/* INFO SIDEBAR */}
        <aside className="space-y-6">
          <Card className="stone-card bg-primary text-primary-foreground border-none shadow-xl dark:bg-card dark:border-border dark:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-secondary dark:text-primary" /> 
                <span className="font-black">Resolution Process</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Instant Logging",
                  desc: "Your report is assigned a unique tracking ID immediately.",
                  icon: ShieldCheck,
                },
                {
                  title: "Ward Routing",
                  desc: "Automatically routed to the specific Ward Officer in charge.",
                  icon: MapPin,
                },
                {
                  title: "Live Updates",
                  desc: "Get SMS and dashboard notifications as the status changes.",
                  icon: Clock,
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-secondary dark:text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{step.title}</h4>
                    <p className="text-xs opacity-80 dark:text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="glass p-6 rounded-xl border-dashed border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <p className="text-xs font-medium leading-relaxed text-foreground">
              <span className="font-black text-primary">Pro Tip:</span> Complaints with clear photos and precise GPS locations are typically resolved <span className="underline font-bold text-secondary">40% faster</span> by our field teams.
            </p>
          </div>
        </aside>
      </div>

      {/* SUCCESS MODAL */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden rounded-2xl bg-card">
          <div className="bg-gradient-to-b from-secondary/20 to-card pt-10 pb-8 px-8 text-center">
            <div className="mx-auto w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-lg mb-6 ring-8 ring-secondary/10">
              <CheckCircle2 className="h-10 w-10 text-secondary-foreground" strokeWidth={3} />
            </div>

            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
                Report Logged
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Your complaint has been successfully registered in the city registry.
              </DialogDescription>
            </DialogHeader>

            {submissionResult && (
              <div className="bg-muted p-4 rounded-xl border border-border mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                  Tracking Code
                </span>
                <div className="text-3xl font-mono font-black text-primary tracking-tighter">
                  {submissionResult.tracking_code}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/citizen/complaints/${submissionResult?.complaint_id}`)}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-md transition-all active:scale-[0.98]"
              >
                Track Status <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full h-12 rounded-xl text-muted-foreground font-bold hover:bg-muted"
              >
                File Another Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}