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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { noticesApi } from "@/features/notices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ---------------------------------- */
/* Utilities                          */
/* ---------------------------------- */
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

/* ---------------------------------- */
/* Main Component                      */
/* ---------------------------------- */
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

      // Note: isRead is not directly on ProjectNotice from getNoticeById yet, but we'll assume it for now or omit.
      // If we need the current user to mark as read:
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await noticesApi.markAsRead(supabase, id, user.id);
    } catch (error) {
      console.error("Error loading notice:", error);
      toast.error("Document Not Found", {
        description:
          "The requested official notice is no longer in the active registry.",
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
        toast.success("Link Secured", { description: "Notice URL copied." });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  if (isLoading) return <NoticeLoadingSkeleton />;

  return (
    <div className="space-y-6 pb-12 px-4 animate-in fade-in duration-700">
      {/* HEADER / HERO */}
      <div className="relative bg-[rgb(var(--primary-brand))] text-white pt-12 pb-32 px-4 sm:px-6 md:px-12 overflow-hidden print:bg-white print:text-black print:pb-10 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/citizen/notices")}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all print:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Registry
          </Button>
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Badge className="bg-[rgb(var(--accent-nature))] text-white border-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20">
            {notice.notice_type?.replace("_", " ")}
          </Badge>
          {notice.is_urgent && (
            <Badge className="bg-[rgb(var(--error-red))] text-white border-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Urgent
            </Badge>
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mb-6"
        >
          {notice.title}
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <MetaItem icon={Calendar} label="Date Published" value={formatOfficialDate(notice.published_at)} />
          <MetaItem icon={MapPin} label="Jurisdiction" value={notice.ward_number ? `Ward No. ${notice.ward_number}` : "Central Metropolitan"} />
          <MetaItem icon={ShieldCheck} label="Verification" value="Digitally Authenticated" />
        </div>
      </div>

      {/* STONE CARD CONTENT */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="stone-card bg-card p-6 sm:p-10 md:p-12 rounded-2xl shadow-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex justify-end gap-2 mb-6 print:hidden">
          <ToolbarButton onClick={handleShare} icon={copied ? Check : Share2} label={copied ? "Copied" : "Share"} />
          <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print PDF" />
        </div>

        {/* Notice Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-strong:text-primary">
          <div dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, "<br>") }} />
        </article>

        {/* Verification Footer */}
        <div className="mt-12 p-6 sm:p-10 rounded-2xl bg-muted/30 border-2 border-dashed border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Feather className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authority ID</p>
              <code className="text-sm font-mono font-bold text-foreground">{notice.id}</code>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl font-bold px-6 sm:px-8 h-10 sm:h-12"
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
          <div className="mt-10 border-t border-border pt-6 print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <FileSearch className="h-6 w-6 text-primary" />
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Attached Documents</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachments.map(file => <AttachmentCard key={file.id} file={file} />)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------------------------------- */
/* Sub-components                      */
/* ---------------------------------- */
function MetaItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon: Icon, label }: any) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="rounded-xl text-muted-foreground hover:text-primary hover:bg-card hover:shadow-sm font-bold transition-all">
      <Icon className="w-4 h-4 mr-2" /> {label}
    </Button>
  );
}

function AttachmentCard({ file }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="group p-4 sm:p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all flex items-center gap-4 cursor-pointer" onClick={() => toast.info(`Downloading ${file.file_name}`)}>
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{file.file_name}</p>
        <p className="text-xs text-muted-foreground uppercase font-black tracking-tighter">
          {file.file_type?.split("/")[1] || "PDF"} • {formatFileSize(file.file_size)}
        </p>
      </div>
      <Download className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary" />
    </motion.div>
  );
}

function NoticeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
