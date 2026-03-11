"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronRight,
  MapPin,
  Clock,
  AlertOctagon,
  FileBadge,
  Sparkles,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoticeCardProps {
  notice: any;
  variant?: "default" | "compact";
}

export default function NoticeCard({
  notice,
  variant = "default",
}: NoticeCardProps) {
  const getTypeConfig = (type: string) => {
    const configs = {
      announcement: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: "📢" },
      emergency: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: "🚨" },
      tender: { color: "text-foreground", bg: "bg-muted", border: "border-border", icon: "📋" },
      event: { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", icon: "🎉" },
      vacancy: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", icon: "💼" },
    };
    return configs[type as keyof typeof configs] || configs.announcement;
  };

  const typeConfig = getTypeConfig(notice.notice_type);
  const isUnread = !notice.is_read;
  const isUrgent = notice.is_urgent;

  return (
    <div className="group transition-all duration-200 hover:-translate-y-0.5">
      <Link href={`/citizen/notices/${notice.id}`}>
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200",
            "hover:shadow-md hover:border-primary/30",
            isUnread && "ring-2 ring-primary/20 bg-primary/5",
            isUrgent && "ring-2 ring-destructive/30"
          )}
        >
          {/* Status Indicator Bar */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 z-10",
              isUrgent ? "bg-destructive" : "bg-primary"
            )}
          />

          <div className="p-5 sm:p-6 pl-7 flex flex-col h-full gap-4">
            {/* Header with Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isUrgent && (
                <Badge className="bg-destructive text-destructive-foreground border-0 px-3 py-1 font-bold text-xs animate-pulse">
                  <AlertOctagon className="w-3 h-3 mr-1.5" /> URGENT
                </Badge>
              )}

              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-medium border px-2.5 py-0.5 text-xs",
                  typeConfig.color,
                  typeConfig.bg,
                  typeConfig.border
                )}
              >
                <span className="mr-1.5">{typeConfig.icon}</span>
                {notice.notice_type?.replace("_", " ")}
              </Badge>

              {isUnread && (
                <Badge className="bg-secondary text-secondary-foreground border-0 px-2.5 py-0.5 font-medium text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> New
                </Badge>
              )}

              <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                <Clock className="w-3 h-3" />
                {format(new Date(notice.published_at), "MMM d, yyyy")}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {notice.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {notice.excerpt ||
                  notice.content
                    .substring(0, 150)
                    .replace(/<[^>]*>?/gm, "")}
                ...
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-medium">
                {notice.ward_number ? (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="font-medium">Ward {notice.ward_number}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3 h-3 text-secondary" />
                    <span className="font-medium">Metropolitan</span>
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                  <FileBadge className="w-3 h-3" />
                  <code className="text-xs font-mono">{notice.id.substring(0, 8)}</code>
                </div>
              </div>

              <Button
                size="sm"
                className={cn(
                  "rounded-xl font-medium transition-all duration-200 shadow-xs",
                  "bg-background text-foreground border border-border",
                  "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                  "active:scale-[0.98]"
                )}
              >
                {isUnread ? (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Read
                  </>
                ) : (
                  "View"
                )}
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}