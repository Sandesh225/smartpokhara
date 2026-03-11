"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  AlertOctagon,
  ShieldCheck,
  Feather,
  FileSearch,
} from "lucide-react";
import { toast } from "sonner";

import { noticesApi } from "@/features/notices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const formatOfficialDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [notice, setNotice] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadNotice();
  }, [id]);

  const loadNotice = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const data = await noticesApi.getNoticeById(supabase, id);
      setNotice(data);
      setAttachments(data.attachments || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) await noticesApi.markAsRead(supabase, id, user.id);
    } catch (error) {
      console.error("Error loading notice:", error);
      toast.error("Document Not Found", {
        description: "The requested official notice is no longer in the active registry.",
      });
      router.push("/citizen/notices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: notice.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link Copied", { description: "Notice URL copied." });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  if (isLoading) return <NoticeLoadingSkeleton />;

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8 animate-fade-in">
        {/* Header / Hero */}
        <div className="relative bg-primary text-primary-foreground pt-10 pb-24 px-6 sm:px-8 md:px-12 overflow-hidden print:bg-card print:text-foreground print:pb-8 rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-background/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/citizen/notices")}
              className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-background/10 rounded-xl transition-all duration-200 print:hidden"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notices
            </Button>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-4">
            <Badge className="bg-secondary text-secondary-foreground border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {notice.notice_type?.replace("_", " ")}
            </Badge>
            {notice.is_urgent && (
              <Badge className="bg-destructive text-destructive-foreground border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> Urgent
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight max-w-3xl mb-6">
            {notice.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <MetaItem icon={Calendar} label="Published" value={formatOfficialDate(notice.published_at)} />
            <MetaItem icon={MapPin} label="Jurisdiction" value={notice.ward_number ? `Ward No. ${notice.ward_number}` : "Central Metropolitan"} />
            <MetaItem icon={ShieldCheck} label="Verification" value="Digitally Authenticated" />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Toolbar */}
          <div className="flex justify-end gap-2 mb-6 print:hidden">
            <ToolbarButton onClick={handleShare} icon={copied ? Check : Share2} label={copied ? "Copied" : "Share"} />
            <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print" />
          </div>

          {/* Notice Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-strong:text-primary">
            <div dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, "<br>") }} />
          </article>

          {/* Verification Footer */}
          <div className="mt-10 p-5 sm:p-8 rounded-2xl bg-muted/30 border-2 border-dashed border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Feather className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Authority ID</p>
                <code className="text-sm font-mono font-medium text-foreground">{notice.id}</code>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-xl font-medium px-6 h-10 border-border"
              onClick={() => {
                navigator.clipboard.writeText(notice.id);
                toast.success("Reference Copied");
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy ID
            </Button>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-8 border-t border-border pt-6 print:hidden">
              <div className="flex items-center gap-3 mb-4">
                <FileSearch className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">Attached Documents</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {attachments.map((file) => <AttachmentCard key={file.id} file={file} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MetaItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-background/10">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/50">{label}</p>
        <p className="text-sm font-medium text-primary-foreground">{value}</p>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon: Icon, label }: any) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="rounded-xl text-muted-foreground hover:text-primary hover:bg-muted font-medium transition-all duration-200">
      <Icon className="w-4 h-4 mr-2" /> {label}
    </Button>
  );
}

function AttachmentCard({ file }: any) {
  return (
    <div
      className="group p-5 sm:p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 flex items-center gap-4 cursor-pointer"
      onClick={() => toast.info(`Downloading ${file.file_name}`)}
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{file.file_name}</p>
        <p className="text-xs text-muted-foreground font-medium">
          {file.file_type?.split("/")[1] || "PDF"} • {formatFileSize(file.file_size)}
        </p>
      </div>
      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
    </div>
  );
}

function NoticeLoadingSkeleton() {
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </main>
  );
}
