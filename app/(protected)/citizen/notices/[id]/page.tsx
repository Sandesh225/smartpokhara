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
  AlertCircle,
  Shield,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; // Switched to Sonner
import { noticesService } from "@/lib/supabase/queries/notices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Premium Date Formatter
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
        description:
          "The requested notice could not be found or has been expired.",
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
          text:
            notice.excerpt ||
            "Important notice from Smart City Pokhara Digital Portal",
          url: url,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link Copied", {
          description: "Notice URL saved to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  };

  const handlePrint = () => {
    toast.info("Preparing Document", {
      description: "Optimizing layout for print...",
    });
    setTimeout(() => window.print(), 500);
  };

  const handleDownloadAttachment = async (attachment: any) => {
    // Premium Download Experience with toast.promise
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
      loading: `Downloading ${attachment.file_name}...`,
      success: "Download complete",
      error: "Could not download file",
    });
  };

  const copyId = () => {
    navigator.clipboard.writeText(notice.id);
    toast.success("Notice ID Copied", {
      description: "Identifier saved for official reference.",
      icon: <Check className="h-4 w-4 text-green-500" />,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 space-y-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-40 mb-8 rounded-full" />
          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <div className="p-10 space-y-4">
              <Skeleton className="h-10 w-3/4 bg-slate-100" />
              <Skeleton className="h-4 w-1/2 bg-slate-50" />
              <Separator className="my-8" />
              <Skeleton className="h-32 w-full bg-slate-50" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!notice) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4"
    >
      <div className="container mx-auto max-w-5xl">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="group rounded-full hover:bg-white hover:shadow-md transition-all px-4"
            onClick={() => router.push("/citizen/notices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Notices
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Digital Service Portal <ChevronRight className="h-3 w-3" /> Notice
            Board
          </div>
        </div>

        <Card className="border-0 shadow-2xl shadow-blue-900/5 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-slate-200">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {notice.is_urgent && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-xl px-4 py-1.5 rounded-full font-black animate-pulse uppercase tracking-wider text-[10px]">
                    <AlertCircle className="mr-2 h-3.5 w-3.5" /> Urgent Action
                    Required
                  </Badge>
                )}
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                  {notice.notice_type}
                </Badge>
                {notice.is_public && (
                  <Badge className="bg-blue-400/20 backdrop-blur-md text-white border-white/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    <Shield className="mr-2 h-3.5 w-3.5" /> Public Access
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight leading-[1.1]">
                {notice.title}
              </h1>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-8 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-6 text-blue-50 font-bold text-sm">
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                    <Calendar className="h-4 w-4 text-blue-200" />
                    {formatDate(new Date(notice.published_at))}
                  </div>
                  {notice.ward_number && (
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                      <MapPin className="h-4 w-4 text-blue-200" />
                      Ward {notice.ward_number}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white hover:text-blue-700 border-white/20 text-white rounded-2xl h-12 px-6 font-bold shadow-lg transition-all active:scale-95"
                    onClick={handleShare}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Share2 className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Link Copied" : "Share Notice"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white hover:text-blue-700 border-white/20 text-white rounded-2xl h-12 px-6 font-bold shadow-lg print:hidden transition-all active:scale-95"
                    onClick={handlePrint}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8 md:p-14">
            {/* Notice Body */}
            <div className="prose prose-blue prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-strong:font-black leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: notice.content.replace(/\n/g, "<br>"),
                }}
              />
            </div>

            {/* Verification Section */}
            <div className="mt-12 p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Official Verification
                </p>
                <p className="text-sm font-bold text-slate-700">
                  Document Reference:{" "}
                  <span className="font-mono text-blue-600 ml-2">
                    {notice.id}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 font-bold h-10 px-4 text-xs shadow-sm transition-all active:scale-95"
                onClick={copyId}
              >
                <Copy className="h-3.5 w-3.5 mr-2" /> Copy Notice ID
              </Button>
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="mt-14 pt-14 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black flex items-center text-slate-900 tracking-tight">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6" />
                    </div>
                    Supporting Documents
                    <span className="ml-4 text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {attachments.length} files
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((file, idx) => (
                    <motion.div
                      key={file.id}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-6 rounded-[1.5rem] border-2 border-slate-100 bg-white hover:border-blue-600/30 hover:shadow-2xl hover:shadow-blue-900/10 transition-all flex items-center justify-between cursor-default"
                    >
                      <div className="flex items-center min-w-0 mr-4">
                        <div className="p-4 rounded-2xl bg-slate-50 shadow-inner mr-4 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate text-base leading-tight">
                            {file.file_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                            {file.file_type || "PDF Document"}
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleDownloadAttachment(file)}
                        className="rounded-2xl bg-slate-100 hover:bg-blue-600 hover:text-white h-12 w-12 transition-all duration-300 active:scale-90"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}