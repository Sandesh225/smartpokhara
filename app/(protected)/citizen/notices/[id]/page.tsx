"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, FileText, Download, Share2, Printer, Copy, Check, AlertCircle, Shield } from "lucide-react";
import { noticesService } from "@/lib/supabase/queries/notices";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [notice, setNotice] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadNotice();
    }
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
      console.error('Error loading notice:', error);
      toast.error('Failed to load notice', {
        description: 'The notice may have been removed',
        duration: 3000,
      });
      router.push('/citizen/notices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: notice.title,
          text: notice.excerpt || notice.content.slice(0, 100),
          url: window.location.href,
        });
        toast.success('Notice shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error('Failed to share notice');
      }
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info('Opening print dialog');
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      toast.info(`Downloading ${attachment.file_name}...`);
      
      const response = await fetch(attachment.file_path);
      if (!response.ok) throw new Error("Failed to download file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download attachment");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', { duration: 2000 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <Skeleton className="h-12 w-32 mb-6 bg-slate-200" />
          <Card className="border-2 border-slate-200 shadow-xl">
            <div className="bg-gradient-to-r from-slate-100 to-blue-100 h-48">
              <Skeleton className="h-8 w-3/4 m-6 bg-slate-300" />
              <Skeleton className="h-4 w-1/2 m-6 bg-slate-200" />
            </div>
            <div className="p-8 space-y-4">
              <Skeleton className="h-64 w-full bg-slate-100" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="container mx-auto max-w-5xl text-center py-20">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Notice Not Found</h1>
          <p className="text-slate-600 mb-8">The notice you're looking for may have been removed or doesn't exist</p>
          <Button onClick={() => router.push('/citizen/notices')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notices
          </Button>
        </div>
      </div>
    );
  }

  const publishedAt = notice.published_at ? new Date(notice.published_at) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-slate-100 transition-colors"
          onClick={() => router.push('/citizen/notices')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notices
        </Button>

        <Card className="border-2 border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {notice.is_urgent && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg px-3 py-1">
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                      Urgent Notice
                    </Badge>
                  )}
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-3 py-1">
                    {notice.notice_type}
                  </Badge>
                  {notice.is_public && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-3 py-1">
                      <Shield className="mr-1.5 h-3.5 w-3.5" />
                      Public Notice
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">{notice.title}</h1>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 px-4"
                  onClick={handleShare}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="mr-2 h-4 w-4" />}
                  {copied ? "Copied!" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 px-4 print:hidden"
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-blue-600">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: notice.content.replace(/\n/g, "<br>") 
                }} 
              />
            </div>

            <Separator className="my-8 bg-slate-200" />

            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200">
              <div className="flex flex-wrap gap-6 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Notice ID:</span>
                  <code className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 shadow-sm">
                    {notice.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-white"
                    onClick={() => copyToClipboard(notice.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
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
            </div>

            {attachments.length > 0 && (
              <>
                <Separator className="my-8 bg-slate-200" />
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center text-slate-900">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span>Attachments ({attachments.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((attachment) => (
                      <Card key={attachment.id} className="overflow-hidden border-2 border-slate-200 hover:shadow-lg transition-all duration-200 group">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mr-4 shadow-md group-hover:scale-110 transition-transform">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-slate-900">{attachment.file_name}</p>
                              <p className="text-sm text-slate-600 mt-0.5">
                                {attachment.file_size ? formatFileSize(attachment.file_size) : "Unknown size"}
                                {attachment.file_type && ` • ${attachment.file_type.toUpperCase()}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="ml-3 flex-shrink-0 border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
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
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}