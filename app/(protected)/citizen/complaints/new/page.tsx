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
import ComplaintForm from "@/app/(protected)/citizen/complaints/_components/ComplaintForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  Info,
  Shield,
  AlertCircle,
  ChevronRight,
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
    };

    fetchData();
  }, [router]);

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
      <div className="min-h-screen bg-background section-spacing container-padding">
        <div className="container mx-auto max-w-7xl space-y-8">
          <Skeleton className="h-10 w-40 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <div className="stone-card max-w-lg w-full overflow-hidden border-destructive/20 elevation-4">
          <div className="h-2 w-full bg-destructive" />
          <div className="card-padding text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Initialization Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background section-spacing container-padding relative overflow-hidden">
      {/* Decorative Brand Blurs */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto max-w-7xl">
        {/* Navigation */}
        <nav className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/citizen/complaints")}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4 group transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </nav>

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Pokhara Citizen Service
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-[1.1]">
            Submit a <span className="text-primary">New Complaint</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 font-medium">
            Help us maintain the beauty of Pokhara. Report issues directly to
            your ward office and track resolution in real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="glass-strong px-5 py-3 rounded-2xl flex items-center gap-3 border-secondary/10 elevation-2">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="text-sm font-bold">Encrypted & Secure</span>
            </div>
            <div className="glass-strong px-5 py-3 rounded-2xl flex items-center gap-3 border-primary/10 elevation-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">Rapid Response</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Entry */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="stone-card elevation-4 overflow-hidden bg-white">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
              <div className="card-padding">
                <ComplaintForm
                  categories={categories}
                  wards={wards}
                  onSubmit={handleSubmitComplaint}
                />
              </div>
            </div>
          </div>

          {/* Educational Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <Card className="stone-card elevation-3 border-none overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Info className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">How it works</h3>
                </div>
              </div>
              <CardContent className="card-padding space-y-8">
                {[
                  {
                    title: "Submit Details",
                    desc: "Provide accurate location and clear photos for faster processing.",
                    color: "bg-primary",
                  },
                  {
                    title: "Smart Routing",
                    desc: "System automatically alerts the specific Ward Officer in charge.",
                    color: "bg-secondary",
                  },
                  {
                    title: "Resolution",
                    desc: "Track progress live and provide feedback once completed.",
                    color: "bg-chart-3",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 relative group">
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full ${step.color} text-white flex items-center justify-center text-sm font-bold z-10 elevation-2`}
                    >
                      {i + 1}
                    </div>
                    {i !== 2 && (
                      <div className="absolute left-4 top-8 w-0.5 h-12 bg-muted" />
                    )}
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 rounded-2xl bg-secondary/5 border-2 border-secondary/10">
                  <p className="text-xs font-medium leading-relaxed">
                    <strong className="text-secondary">Pro Tip:</strong>{" "}
                    High-quality photos of the issue help our teams triage and
                    fix problems up to 40% faster.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>

      {/* Modern Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-none bg-white p-0 overflow-hidden rounded-[2rem] elevation-5">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 pt-10 pb-8 px-8 text-center">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
              <div className="relative h-24 w-24 bg-secondary rounded-full flex items-center justify-center elevation-4 ring-4 ring-white">
                <CheckCircle2
                  className="h-12 w-12 text-white"
                  strokeWidth={3}
                />
              </div>
            </div>

            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-extrabold text-foreground tracking-tight">
                Success!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Your complaint has been logged in the city registry.
              </DialogDescription>
            </DialogHeader>

            {submissionResult && (
              <div className="stone-panel p-6 mb-8 bg-muted/30 border-2 border-secondary/20">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                  Tracking Code
                </span>
                <div className="text-3xl font-mono font-black text-primary tracking-tighter">
                  {submissionResult.tracking_code}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() =>
                  router.push(
                    `/citizen/complaints/${submissionResult?.complaint_id}`
                  )
                }
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold elevation-3 text-lg"
              >
                Track Status
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full h-12 rounded-xl text-muted-foreground font-bold hover:text-primary"
              >
                Submit Another Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}