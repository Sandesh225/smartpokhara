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

export default function NoticeDetail({
  notice,
  attachments,
}: NoticeDetailProps) {
  const [copied, setCopied] = useState(false);
  const publishedAt = notice.published_at
    ? new Date(notice.published_at)
    : null;

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
    <Card className="border-2 border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border">
      {/* Premium Header */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 print:bg-blue-600 print:p-6">
        <div className="flex flex-col gap-6">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {notice.is_urgent && (
              <Badge className="bg-linear-to-r from-red-600 to-orange-600 text-white border-0 shadow-lg px-3 py-1.5 gap-1.5 text-xs font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                Urgent
              </Badge>
            )}
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 capitalize text-xs font-semibold">
              {notice.notice_type?.replace(/_/g, " ")}
            </Badge>
            {notice.is_public && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 gap-1.5 text-xs font-semibold">
                <Shield className="h-3.5 w-3.5" />
                Public
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white">
            {notice.title}
          </h1>

          {/* Metadata and Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
              {publishedAt && (
                <div
                  className="flex items-center gap-2"
                  title={format(publishedAt, "PPpp")}
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">
                    {format(publishedAt, "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              )}
              {notice.ward_number && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Ward {notice.ward_number}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white h-10 px-4 transition-all duration-200 font-medium"
                onClick={handleShare}
                aria-label="Share notice"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white h-10 px-4 transition-all duration-200 font-medium"
                onClick={handlePrint}
                aria-label="Print notice"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8 print:p-6">
        {/* Content */}
        <div className="prose prose-slate prose-base sm:prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-strong:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          <div
            dangerouslySetInnerHTML={{
              __html: (notice.content || "").replace(/\n/g, "<br>"),
            }}
          />
        </div>

        <Separator className="my-8 bg-slate-200" />

        {/* Metadata Card */}
        <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-linear-to-r from-slate-50 to-blue-50/30 border-b-2 border-slate-200 py-4 px-6">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Notice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              {/* Notice ID */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                  Notice ID
                </span>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-100 px-3 py-2 rounded-lg text-xs font-mono border border-slate-200 shadow-sm flex-1 truncate">
                    {notice.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-slate-100 transition-colors flex-shrink-0"
                    onClick={() => copyToClipboard(notice.id)}
                    aria-label="Copy notice ID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Published Date */}
              {publishedAt && (
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                    Published
                  </span>
                  <span className="text-slate-700 font-medium">
                    {format(publishedAt, "PPP")}
                  </span>
                </div>
              )}

              {/* Ward */}
              {notice.ward_number && (
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                    Target Ward
                  </span>
                  <span className="text-slate-700 font-medium">
                    Ward {notice.ward_number}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments Section */}
        {attachments?.length > 0 && (
          <>
            <Separator className="my-8 bg-slate-200" />

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-slate-900">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span>
                  Attachments
                  <span className="text-slate-500 font-normal ml-2">
                    ({attachments.length})
                  </span>
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((a) => (
                  <Card
                    key={a.id}
                    className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group overflow-hidden"
                  >
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center min-w-0 flex-1 gap-4">
                        <div className="p-3 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-md group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                          <FileText className="h-6 w-6 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate text-slate-900 text-sm sm:text-base">
                            {a.file_name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            {a.file_size
                              ? formatFileSize(a.file_size)
                              : "Unknown size"}
                            {a.file_type && (
                              <>
                                <span className="mx-1.5">•</span>
                                <span className="uppercase">
                                  {String(a.file_type)}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAttachment(a)}
                        className="border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 flex-shrink-0 h-10"
                        aria-label={`Download ${a.file_name}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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