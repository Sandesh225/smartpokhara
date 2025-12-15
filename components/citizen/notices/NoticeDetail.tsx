"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  AlertCircle,
  Share2,
  Printer,
  Calendar,
  MapPin,
  Copy,
  Check,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface NoticeDetailProps {
  notice: {
    id: string;
    title: string;
    content: string;
    notice_type: string;
    published_at: string;
    ward_number?: number | null;
    is_urgent?: boolean;
    is_public?: boolean;
    excerpt?: string;
  };
  attachments: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
  }>;
}

export default function NoticeDetail({ notice, attachments }: NoticeDetailProps) {
  const [copied, setCopied] = useState(false);
  const publishedAt = notice.published_at ? new Date(notice.published_at) : null;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", { duration: 1600 });
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: notice.title,
          text: notice.excerpt || notice.content.slice(0, 120),
          url,
        });
        toast.success("Notice shared");
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Failed to share notice");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info("Opening print dialog");
  };

  const handleDownloadAttachment = async (a: any) => {
    try {
      toast.info(`Downloading ${a.file_name}…`);
      const res = await fetch(a.file_path);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = a.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      toast.success("Download started");
    } catch {
      toast.error("Failed to download attachment");
    }
  };

  return (
    <Card className="border-2 border-slate-200 shadow-2xl overflow-hidden print:shadow-none">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 print:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {notice.is_urgent && (
                <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-md px-3 py-1 gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Urgent
                </Badge>
              )}
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 capitalize">
                {notice.notice_type?.replace(/_/g, " ")}
              </Badge>
              {notice.is_public && (
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Public
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
              {notice.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              {publishedAt && (
                <div className="flex items-center" title={format(publishedAt, "PPpp")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(publishedAt, "MMMM d, yyyy 'at' h:mm a")}
                </div>
              )}
              {notice.ward_number && (
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Ward {notice.ward_number}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 px-4"
              onClick={handleShare}
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 px-4"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-8 print:p-6">
        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-blue-600">
          <div
            dangerouslySetInnerHTML={{
              __html: (notice.content || "").replace(/\n/g, "<br>"),
            }}
          />
        </div>

        <Separator className="my-8 bg-slate-200" />

        {/* Metadata */}
        <Card className="border-2 border-slate-200 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Notice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Notice ID:</span>
                <code className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 shadow-sm">
                  {notice.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => copyToClipboard(notice.id)}
                  aria-label="Copy notice id"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {publishedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Published:</span>
                  <span>{format(publishedAt, "PPP")}</span>
                </div>
              )}

              {notice.ward_number && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Target Ward:</span>
                  <span>Ward {notice.ward_number}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        {attachments?.length > 0 && (
          <>
            <Separator className="my-8 bg-slate-200" />

            <h3 className="text-2xl font-bold mb-6 flex items-center text-slate-900">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Attachments ({attachments.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((a) => (
                <Card
                  key={a.id}
                  className="border-2 border-slate-200 hover:shadow-lg transition-all duration-200 group overflow-hidden"
                >
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate text-slate-900">{a.file_name}</p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {a.file_size ? formatFileSize(a.file_size) : "Unknown size"}
                          {a.file_type ? ` • ${String(a.file_type).toUpperCase()}` : ""}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(a)}
                      className="border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
