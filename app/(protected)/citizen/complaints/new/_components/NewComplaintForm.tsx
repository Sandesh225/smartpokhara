"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  FileText, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Clock 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ComplaintForm from "@/app/(protected)/citizen/complaints/_components/ComplaintForm";

interface NewComplaintFormProps {
  categories: any[];
  wards: any[];
  createComplaint: (data: any) => Promise<any>;
}

export default function NewComplaintForm({
  categories,
  wards,
  createComplaint,
}: NewComplaintFormProps) {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    tracking_code: string;
    complaint_id: string;
  } | null>(null);

  const handleSubmit = async (formData: any, attachments: File[]) => {
    try {
      const result = await createComplaint({
        ...formData,
        media: attachments,
      });

      setSubmissionResult({
        tracking_code: result.tracking_code,
        complaint_id: result.id,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      // Error handled by mutation usually, but we rethrow if needed
      throw err;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Area */}
      <div className="lg:col-span-2">
        <Card className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border pb-4 mb-0">
            <CardTitle className="text-xl font-bold">Tell us what happened</CardTitle>
            <p className="text-sm text-muted-foreground">
              The more you tell us, the faster we can help.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ComplaintForm
              categories={categories}
              wards={wards}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>

      {/* Info Sidebar */}
      <aside className="space-y-6">
        <Card className="bg-primary/5 border-primary/10 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                title: "Quickly saved",
                desc: "We save your complaint right away and give you a special code to check on it.",
                icon: Zap,
              },
              {
                title: "Sent to the right person",
                desc: "We send your message straight to the officer in your area.",
                icon: MapPin,
              },
              {
                title: "Get updates",
                desc: "We&apos;ll let you know as soon as we start working on it.",
                icon: Clock,
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-border bg-muted/5 rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">💡 Tip:</span>{" "}
              Adding clear photos and the exact location helps us fix things{" "}
              <span className="font-bold text-primary">much faster!</span>
            </p>
          </CardContent>
        </Card>
      </aside>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="text-center p-8 bg-card animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-primary animate-scale-in" />
            </div>

            <DialogHeader className="mb-8 p-0">
              <DialogTitle className="text-3xl font-bold tracking-tight mb-2">
                Complaint Sent!
              </DialogTitle>
              <DialogDescription className="text-base">
                We&apos;ve received your complaint and it&apos;s now in our system.
              </DialogDescription>
            </DialogHeader>

            {submissionResult && (
              <div className="bg-muted/50 border border-border p-5 rounded-2xl mb-8 group transition-all hover:border-primary/30">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
                  Your Tracking Code
                </span>
                <div className="text-3xl font-mono font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                  {submissionResult.tracking_code}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/citizen/complaints/${submissionResult?.complaint_id}`)}
                className="w-full h-12 bg-primary hover:opacity-90 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/10"
              >
                Check Status
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full h-12 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-muted"
              >
                Send another one
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
