"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
  Clock,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface NoticeCardProps {
  notice: {
    id: string;
    title: string;
    content: string;
    notice_type: string;
    published_at: string;
    ward_number?: number | null;
    is_urgent?: boolean;
    is_public?: boolean;
    has_attachments?: boolean;
    is_read?: boolean;
    excerpt?: string;
  };
  variant?: "default" | "compact";
}

const TYPE_META: Record<
  string,
  { label: string; pill: string; icon: React.ReactNode }
> = {
  announcement: {
    label: "Announcement",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  maintenance: {
    label: "Maintenance",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  public_service: {
    label: "Public Service",
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
  payment: {
    label: "Payment",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  event: {
    label: "Event",
    pill: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  emergency: {
    label: "Emergency",
    pill: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  tender: {
    label: "Tender",
    pill: "bg-slate-50 text-slate-700 border-slate-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  policy: {
    label: "Policy Update",
    pill: "bg-slate-50 text-slate-700 border-slate-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  holiday: {
    label: "Holiday Notice",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
};

function excerpt(text: string, max = 160) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export default function NoticeCard({ notice, variant = "default" }: NoticeCardProps) {
  const publishedAt = new Date(notice.published_at);
  const isUnread = !notice.is_read;
  const typeMeta = TYPE_META[notice.notice_type] ?? {
    label: notice.notice_type?.replace(/_/g, " ") || "Notice",
    pill: "bg-slate-50 text-slate-700 border-slate-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  };

  const leftAccent = notice.is_urgent
    ? "border-l-red-500"
    : isUnread
      ? "border-l-blue-500"
      : "border-l-transparent";

  const subtleBg = notice.is_urgent
    ? "bg-gradient-to-br from-red-50/60 via-orange-50/30 to-white"
    : isUnread
      ? "bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-white"
      : "bg-white";

  // Compact (grid) card
  if (variant === "compact") {
    return (
      <Link href={`/citizen/notices/${notice.id}`} className="block">
        <Card
          className={cn(
            "relative overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-xl transition-all duration-300",
            "group cursor-pointer",
            "border-l-4",
            leftAccent,
            subtleBg
          )}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-50/0 via-blue-50/40 to-indigo-50/0" />

          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isUnread && (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-xs font-semibold text-blue-700">Unread</span>
                    </span>
                  )}
                  {notice.is_urgent && (
                    <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-sm gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Urgent
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">
                  {notice.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {excerpt(notice.excerpt || notice.content, 130)}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <Badge className={cn("border font-medium gap-1.5", typeMeta.pill)}>
                    {typeMeta.icon}
                    {typeMeta.label}
                  </Badge>

                  {notice.is_public && (
                    <Badge className="bg-white/70 text-slate-700 border border-slate-200 gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Public
                    </Badge>
                  )}

                  {notice.ward_number ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      Ward {notice.ward_number}
                    </span>
                  ) : null}

                  {notice.has_attachments ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      Attachment
                    </span>
                  ) : null}
                </div>
              </div>

              <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </CardContent>

          <CardFooter className="px-5 py-3 border-t border-slate-100 bg-white/60 relative">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(publishedAt, { addSuffix: true })}
              </span>

              <span className="text-xs font-semibold text-blue-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  // Default (list) card
  return (
    <Link href={`/citizen/notices/${notice.id}`} className="block">
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300",
          "group cursor-pointer",
          "border-l-4",
          leftAccent,
          subtleBg
        )}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-50/0 via-blue-50/40 to-indigo-50/0" />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {isUnread && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-sm gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/90" />
                    New
                  </Badge>
                )}

                {notice.is_urgent && (
                  <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-sm gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Urgent
                  </Badge>
                )}

                <Badge className={cn("border font-medium gap-1.5", typeMeta.pill)}>
                  {typeMeta.icon}
                  {typeMeta.label}
                </Badge>

                {notice.is_public && (
                  <Badge className="bg-white/70 text-slate-700 border border-slate-200 gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Public
                  </Badge>
                )}

                {notice.has_attachments && (
                  <Badge className="bg-slate-50 text-slate-700 border border-slate-200 gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Attachment
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                {notice.title}
              </h3>

              <p className="text-slate-600 leading-relaxed line-clamp-3">
                {excerpt(notice.excerpt || notice.content, 190)}
              </p>
            </div>

            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-slate-100 bg-white/70 relative flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2" title={format(publishedAt, "PPpp")}>
              <Calendar className="h-4 w-4 text-slate-500" />
              {formatDistanceToNow(publishedAt, { addSuffix: true })}
            </span>

            {notice.ward_number ? (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Ward {notice.ward_number}
              </span>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold"
            aria-label="Read notice"
          >
            Read More
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
