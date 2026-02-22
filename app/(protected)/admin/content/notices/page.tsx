// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/content/notices/page.tsx - NOTICES LIST
// ═══════════════════════════════════════════════════════════

"use client";

import { useNotices, useNoticeMutations } from "@/features/notices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Trash2,
  Edit,
  AlertCircle,
  MapPin,
  Clock,
  User,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function NoticesPage() {
  const { data, isLoading: loading } = useNotices({ publishedOnly: false });
  const notices = data?.data || [];
  const { deleteNotice } = useNoticeMutations();

  const getNoticeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      announcement: "border-info-blue/30 bg-info-blue/10 text-info-blue",
      maintenance:
        "border-warning-amber/30 bg-warning-amber/10 text-warning-amber",
      payment: "border-primary/30 bg-primary/10 text-primary",
      event: "border-success-green/30 bg-success-green/10 text-success-green",
      alert: "border-error-red/30 bg-error-red/10 text-error-red",
      public_service: "border-secondary/30 bg-secondary/10 text-secondary",
    };
    return (
      colors[type] ||
      "border-muted-foreground/30 bg-muted text-muted-foreground"
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
              Notices & Announcements
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
              {notices.length} active notice{notices.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button asChild className="gap-2 font-bold">
          <Link href="/admin/content/notices/create">
            <Megaphone className="w-4 h-4" />
            Create Notice
          </Link>
        </Button>
      </div>

      {/* NOTICES LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground font-medium">
            Loading notices...
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              className={cn(
                "stone-card hover:shadow-lg transition-all duration-300 group",
                notice.is_urgent && "border-l-4 border-l-error-red"
              )}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* CONTENT */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* HEADER ROW */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.is_urgent && (
                        <Badge
                          variant="outline"
                          className="border-error-red/30 bg-error-red/10 text-error-red text-xs font-bold gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          URGENT
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-bold capitalize",
                          getNoticeTypeColor(notice.notice_type)
                        )}
                      >
                        {notice.notice_type.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-base md:text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {notice.title}
                    </h3>

                    {/* EXCERPT */}
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                      {notice.excerpt}
                    </p>

                    {/* META INFO */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">
                          {notice.creator?.full_name || "System"}
                        </span>
                      </div>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(notice.published_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1">
                        {notice.is_public ? (
                          <>
                            <Globe className="w-3 h-3 text-success-green" />
                            <span className="text-success-green font-medium">
                              Public
                            </span>
                          </>
                        ) : notice.ward ? (
                          <>
                            <MapPin className="w-3 h-3 text-warning-amber" />
                            <span className="text-warning-amber font-medium">
                              Ward {notice.ward.ward_number}
                            </span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span>Internal</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex md:flex-col gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Link href={`/admin/content/notices/${notice.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this notice?"
                          )
                        ) {
                          deleteNotice.mutate(notice.id);
                        }
                      }}
                      className="hover:bg-error-red/10 hover:text-error-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* EMPTY STATE */}
          {notices.length === 0 && (
            <div className="stone-card flex flex-col items-center justify-center py-12 md:py-20">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Megaphone className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                No Notices Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first notice to get started
              </p>
              <Button asChild>
                <Link href="/admin/content/notices/create">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Create Notice
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
