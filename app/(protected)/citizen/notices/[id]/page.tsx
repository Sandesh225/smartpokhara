"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Clock,
  Feather,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { noticesService } from "@/lib/supabase/queries/notices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Enhanced Date Formatter for Official Records
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

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
      const data = await noticesService.getNoticeById(id);
      setNotice(data.notice);
      setAttachments(data.attachments);

      if (!data.isRead) {
        await noticesService.markNoticeAsRead(id);
      }
    } catch (error) {
      console.error("Error loading notice:", error);
      toast.error("Notice Unavailable", {
        description: "The requested document could not be retrieved.",
      });
      router.push("/citizen/notices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: notice.title,
          text: notice.excerpt || "Official Notice - Pokhara Metropolitan City",
          url: url,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link Copied", {
          description: "Secure link copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") toast.error("Sharing failed");
    }
  };

  const handlePrint = () => {
    toast.info("Preparing Document", {
      description: "Formatting for official print layout...",
    });
    setTimeout(() => window.print(), 500);
  };

  const handleDownloadAttachment = async (attachment: any) => {
    const downloadAction = async () => {
      const response = await fetch(attachment.file_path);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    toast.promise(downloadAction(), {
      loading: `Retrieving ${attachment.file_name}...`,
      success: "Download complete",
      error: "Download failed",
    });
  };

  const copyId = () => {
    navigator.clipboard.writeText(notice.id);
    toast.success("Reference ID Copied", {
      description: "Identifier saved for official correspondence.",
      icon: <Check className="h-4 w-4 text-[rgb(var(--success-green))]" />,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--neutral-stone))] py-12 px-4 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-8 w-32 rounded-full bg-[rgb(var(--neutral-stone-200))]" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4 rounded-2xl bg-[rgb(var(--neutral-stone-200))]" />
            <Skeleton className="h-6 w-1/2 rounded-lg bg-[rgb(var(--neutral-stone-100))]" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-[2rem] bg-white" />
        </div>
      </div>
    );
  }

  if (!notice) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[rgb(var(--neutral-stone))] font-sans pb-20 relative"
    >
      {/* --- Immersive Header (Phewa Deep Blue) --- */}
      {/* Serves as the official "Letterhead" background */}
      <div className="bg-[rgb(var(--primary-brand))] text-white pt-10 pb-32 px-4 sm:px-8 relative overflow-hidden print:bg-white print:text-black print:pb-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/citizen/notices")}
            className="text-white/70 hover:text-white hover:bg-white/10 mb-8 rounded-full pl-2 pr-4 transition-all print:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Board
          </Button>

          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-[rgb(var(--accent-nature))] text-white border-0 px-3 py-1.5 text-xs uppercase tracking-wider font-bold shadow-sm">
              {notice.notice_type?.replace("_", " ")}
            </Badge>

            {notice.is_urgent && (
              <Badge className="bg-[rgb(var(--error-red))] text-white border-0 animate-pulse px-3 py-1.5 text-xs uppercase tracking-wider font-bold shadow-lg shadow-red-900/20">
                <AlertOctagon className="w-3 h-3 mr-1.5" /> Urgent Action
              </Badge>
            )}

            {notice.is_public && (
              <Badge
                variant="outline"
                className="text-blue-100 border-blue-400/30 px-3 py-1.5 text-xs uppercase tracking-wider font-bold"
              >
                <ShieldCheck className="w-3 h-3 mr-1.5" /> Public Record
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-8 max-w-4xl text-balance">
            {notice.title}
          </h1>

          {/* Header Metadata */}
          <div className="flex flex-wrap gap-6 text-sm font-medium text-blue-100/90 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase opacity-70 tracking-widest font-bold">
                  Published
                </span>
                <span>{formatDate(new Date(notice.published_at))}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase opacity-70 tracking-widest font-bold">
                  Location
                </span>
                <span>
                  {notice.ward_number
                    ? `Ward No. ${notice.ward_number}`
                    : "Metropolitan City Office"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase opacity-70 tracking-widest font-bold">
                  Time
                </span>
                <span>
                  {new Date(notice.published_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content "Stone Card" --- */}
      {/* Floats over the header to create depth */}
      <div className="container mx-auto max-w-5xl px-4 -mt-20 relative z-20 print:mt-0 print:px-0">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[rgb(var(--neutral-stone-600)/0.15)] overflow-hidden border border-[rgb(var(--neutral-stone-200))] print:shadow-none print:border-none print:rounded-none">
          {/* Toolbar (Glass Effect) */}
          <div className="bg-[rgb(var(--neutral-stone-50))] border-b border-[rgb(var(--neutral-stone-200))] p-3 flex justify-end gap-2 print:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="rounded-xl text-[rgb(var(--neutral-stone-600))] hover:bg-white hover:text-[rgb(var(--primary-brand))] hover:shadow-sm transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied" : "Share"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl text-[rgb(var(--neutral-stone-600))] hover:bg-white hover:text-[rgb(var(--primary-brand))] hover:shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </div>

          <div className="p-8 md:p-14 lg:p-16">
            {/* Prose Content */}
            <div
              className="prose prose-lg max-w-none 
              prose-headings:font-bold prose-headings:text-[rgb(var(--text-ink))] 
              prose-p:text-[rgb(var(--neutral-stone-600))] prose-p:leading-8
              prose-strong:text-[rgb(var(--primary-brand))] prose-strong:font-black
              prose-a:text-[rgb(var(--info-blue))] prose-a:no-underline hover:prose-a:underline
              prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-[rgb(var(--accent-nature))]"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: notice.content.replace(/\n/g, "<br>"),
                }}
              />
            </div>

            {/* Official Verification Footer */}
            <div className="mt-20 p-8 rounded-3xl bg-[rgb(var(--neutral-stone-50))] border-2 border-[rgb(var(--neutral-stone-100))] flex flex-col sm:flex-row items-center justify-between gap-6 print:border-gray-300 print:bg-white">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white border border-[rgb(var(--neutral-stone-200))] flex items-center justify-center shadow-sm text-[rgb(var(--primary-brand))]">
                  <Feather className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[rgb(var(--neutral-stone-400))] uppercase tracking-[0.2em]">
                    Official Verification
                  </p>
                  <p className="text-sm font-bold text-[rgb(var(--text-ink))]">
                    Digital Signature Reference
                  </p>
                  <code className="text-xs font-mono text-[rgb(var(--primary-brand))] bg-blue-50 px-2 py-0.5 rounded">
                    {notice.id}
                  </code>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-white border-[rgb(var(--neutral-stone-200))] hover:border-[rgb(var(--primary-brand))] text-[rgb(var(--text-ink))] font-bold h-10 px-5 shadow-sm transition-all print:hidden"
                onClick={copyId}
              >
                <Copy className="h-3.5 w-3.5 mr-2 text-[rgb(var(--neutral-stone-400))]" />
                Copy ID
              </Button>
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="mt-16 pt-16 border-t border-[rgb(var(--neutral-stone-100))] print:hidden">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-[rgb(var(--primary-brand)/0.1)] text-[rgb(var(--primary-brand))] flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-black text-[rgb(var(--text-ink))] tracking-tight">
                    Supporting Documents
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-[rgb(var(--neutral-stone-100))] text-[rgb(var(--neutral-stone-600))]"
                  >
                    {attachments.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {attachments.map((file, idx) => (
                    <motion.div
                      key={file.id}
                      whileHover={{ y: -4 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-5 rounded-[1.5rem] border border-[rgb(var(--neutral-stone-200))] bg-white hover:border-[rgb(var(--primary-brand)/0.3)] hover:shadow-xl hover:shadow-[rgb(var(--primary-brand)/0.05)] transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden"
                      onClick={() => handleDownloadAttachment(file)}
                    >
                      {/* Decorative background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary-brand)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="h-12 w-12 rounded-2xl bg-[rgb(var(--neutral-stone-50))] border border-[rgb(var(--neutral-stone-100))] flex items-center justify-center text-[rgb(var(--neutral-stone-400))] group-hover:bg-[rgb(var(--primary-brand))] group-hover:text-white group-hover:border-[rgb(var(--primary-brand))] transition-all duration-300 z-10">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0 z-10">
                        <p className="font-bold text-[rgb(var(--text-ink))] truncate text-base group-hover:text-[rgb(var(--primary-brand))] transition-colors">
                          {file.file_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 border-[rgb(var(--neutral-stone-200))] text-[rgb(var(--neutral-stone-500))] uppercase font-bold"
                          >
                            {file.file_type?.split("/")[1] || "PDF"}
                          </Badge>
                          <span className="text-xs text-[rgb(var(--neutral-stone-400))] font-medium">
                            {formatFileSize(file.file_size)}
                          </span>
                        </div>
                      </div>

                      <div className="h-10 w-10 rounded-full bg-[rgb(var(--neutral-stone-50))] flex items-center justify-center text-[rgb(var(--neutral-stone-400))] group-hover:bg-white group-hover:text-[rgb(var(--primary-brand))] group-hover:shadow-md transition-all z-10">
                        <Download className="h-5 w-5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}