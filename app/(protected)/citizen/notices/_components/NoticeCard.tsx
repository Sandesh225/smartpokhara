"use client";

import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
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
      announcement: {
        color: "text-primary dark:text-primary",
        bg: "bg-primary/10 dark:bg-primary/20",
        border: "border-primary/30 dark:border-primary/30",
        icon: "📢",
      },
      emergency: {
        color: "text-destructive",
        bg: "bg-destructive/10 dark:bg-destructive/20",
        border: "border-destructive/30",
        icon: "🚨",
      },
      tender: {
        color: "text-foreground",
        bg: "bg-muted dark:bg-muted",
        border: "border-border dark:border-border",
        icon: "📋",
      },
      event: {
        color: "text-secondary dark:text-secondary",
        bg: "bg-secondary/10 dark:bg-secondary/20",
        border: "border-secondary/30 dark:border-secondary/30",
        icon: "🎉",
      },
      vacancy: {
        color: "text-warning-amber",
        bg: "bg-warning-amber/10",
        border: "border-warning-amber/30",
        icon: "💼",
      },
    };
    return (
      configs[type as keyof typeof configs] || configs.announcement
    );
  };

  const typeConfig = getTypeConfig(notice.notice_type);
  const isUnread = !notice.is_read;
  const isUrgent = notice.is_urgent;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      <Link href={`/citizen/notices/${notice.id}`}>
        <div
          className={cn(
            "stone-card relative overflow-hidden transition-all duration-300",
            "hover:shadow-xl dark:hover:shadow-2xl hover:border-primary/40 dark:hover:border-primary/40",
            isUnread &&
              "ring-2 ring-primary/30 dark:ring-primary/40 bg-primary/[0.02] dark:bg-primary/[0.05]",
            isUrgent && "ring-2 ring-destructive/40 animate-pulse"
          )}
        >
          {/* Status Indicator Bar */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 z-10",
              isUrgent
                ? "bg-destructive"
                : "bg-primary dark:bg-primary"
            )}
          />

          {/* Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 dark:to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="p-6 pl-8 flex flex-col h-full gap-4 relative z-10">
            {/* Header with Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isUrgent && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Badge className="bg-destructive text-destructive-foreground border-0 hover:bg-destructive px-3 py-1.5 shadow-lg shadow-destructive/30 font-black text-[10px]">
                    <AlertOctagon className="w-3 h-3 mr-1.5" /> URGENT
                  </Badge>
                </motion.div>
              )}

              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-bold border-2 px-3 py-1.5 text-[10px] backdrop-blur-sm",
                  typeConfig.color,
                  typeConfig.bg,
                  typeConfig.border
                )}
              >
                <span className="mr-1.5">{typeConfig.icon}</span>
                {notice.notice_type?.replace("_", " ")}
              </Badge>

              {isUnread && (
                <Badge className="bg-warning-amber text-white border-0 hover:bg-warning-amber px-3 py-1.5 font-black text-[10px] shadow-md">
                  <Sparkles className="w-3 h-3 mr-1.5" /> New
                </Badge>
              )}

              <div className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(notice.published_at), "MMM d, yyyy")}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 flex-1">
              <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
                {notice.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {notice.excerpt ||
                  notice.content
                    .substring(0, 150)
                    .replace(/<[^>]*>?/gm, "")}
                ...
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/50 dark:border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-medium">
                {notice.ward_number ? (
                  <div className="flex items-center gap-1.5 bg-muted/50 dark:bg-muted px-3 py-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-primary dark:text-primary" />
                    <span className="font-bold">
                      Ward {notice.ward_number}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-muted/50 dark:bg-muted px-3 py-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-secondary dark:text-secondary" />
                    <span className="font-bold">Metropolitan</span>
                  </div>
                )}

                <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                  <FileBadge className="w-3.5 h-3.5" />
                  <code className="text-xs font-mono">
                    {notice.id.substring(0, 8)}
                  </code>
                </div>
              </div>

              <Button
                size="sm"
                className={cn(
                  "rounded-xl font-bold transition-all shadow-sm group/btn",
                  "bg-background dark:bg-background text-foreground border-2 border-border dark:border-border",
                  "hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:border-primary",
                  "hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30",
                  "active:scale-95"
                )}
              >
                {isUnread ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Read
                  </>
                ) : (
                  <>
                    View
                  </>
                )}
                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Unread Indicator Glow */}
          {isUnread && (
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl pointer-events-none"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}