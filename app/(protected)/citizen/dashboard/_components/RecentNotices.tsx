"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Newspaper,
  AlertTriangle,
  Calendar,
  Building,
  Globe,
  Pin,
  ChevronRight,
  Eye,
  Bookmark,
  Share2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  notice_type: string;
  ward_id: string | null;
  is_public: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
}

interface RecentNoticesProps {
  notices: Notice[];
  wardNumber: number | null;
  loading?: boolean;
}

const NOTICE_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }
> = {
  announcement: {
    label: "Announcement",
    icon: Bell,
    color: "text-blue-700",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  maintenance: {
    label: "Maintenance",
    icon: Building,
    color: "text-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    color: "text-rose-700",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
  event: {
    label: "Event",
    icon: Calendar,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  payment: {
    label: "Payment",
    icon: Bell,
    color: "text-purple-700",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  public_service: {
    label: "Public Service",
    icon: Globe,
    color: "text-cyan-700",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
};

export default function RecentNotices({
  notices,
  wardNumber,
  loading = false,
}: RecentNoticesProps) {
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Set<string>>(
    new Set()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNoticeTypeConfig = (noticeType: string) => {
    return (
      NOTICE_TYPE_CONFIG[noticeType] || {
        label: noticeType,
        icon: Newspaper,
        color: "text-gray-700",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
      }
    );
  };

  const handleBookmark = (noticeId: string) => {
    const newBookmarks = new Set(bookmarkedNotices);
    if (newBookmarks.has(noticeId)) {
      newBookmarks.delete(noticeId);
      toast.info("Notice removed from bookmarks");
    } else {
      newBookmarks.add(noticeId);
      toast.success("Notice bookmarked");
    }
    setBookmarkedNotices(newBookmarks);
  };

  const handleShare = async (notice: Notice) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: notice.title,
          text: notice.excerpt,
          url: `${window.location.origin}/citizen/notices/${notice.id}`,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      navigator.clipboard.writeText(
        `${notice.title}\n${notice.excerpt}\n${window.location.origin}/citizen/notices/${notice.id}`
      );
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-border shadow-md elevation-2">
        <CardHeader className="pb-4">
          <Skeleton className="h-7 w-36 rounded-full" />
          <Skeleton className="h-5 w-48 mt-3 rounded-full" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-5 p-5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="border-2 border-border shadow-md hover:shadow-lg transition-all duration-300 elevation-2 hover:elevation-3"
        role="region"
        aria-label="Recent notices from municipality"
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl elevation-1">
                  <Newspaper
                    className="h-5 w-5 text-purple-700 dark:text-purple-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="font-black">Recent Notices</span>
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground font-semibold">
                  Updates for {wardNumber ? `Ward ${wardNumber}` : "your area"}
                </p>
                <Badge
                  variant="outline"
                  className="gap-2 text-xs font-black px-3 py-1 border-2 elevation-1"
                >
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[340px]">
            <AnimatePresence mode="wait">
              {notices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-16 px-5 text-center"
                >
                  <div className="p-6 bg-muted rounded-2xl mb-5 shadow-sm elevation-1">
                    <Newspaper
                      className="h-12 w-12 text-muted-foreground/60"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-black text-lg mb-2">
                    No notices available
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Check back later for updates from your municipality
                  </p>
                </motion.div>
              ) : (
                <div
                  className="divide-y-2 divide-border"
                  role="list"
                  aria-label="List of recent notices"
                >
                  {notices.map((notice, index) => {
                    const noticeTypeConfig = getNoticeTypeConfig(
                      notice.notice_type
                    );
                    const NoticeTypeIcon = noticeTypeConfig.icon;
                    const isBookmarked = bookmarkedNotices.has(notice.id);
                    const isExpanded = expandedNotice === notice.id;

                    return (
                      <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        className="p-5 hover:bg-muted/60 dark:hover:bg-muted/40 transition-all duration-300"
                        role="listitem"
                      >
                        <div
                          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl -m-2 p-2"
                          onClick={() =>
                            setExpandedNotice(isExpanded ? null : notice.id)
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedNotice(isExpanded ? null : notice.id);
                            }
                          }}
                          aria-expanded={isExpanded}
                          aria-label={`${notice.title}. Click to ${isExpanded ? "collapse" : "expand"}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                                <Badge
                                  className={cn(
                                    noticeTypeConfig.bgColor,
                                    noticeTypeConfig.color,
                                    "border-0 font-bold shadow-sm px-3 py-1.5"
                                  )}
                                >
                                  <NoticeTypeIcon
                                    className="h-3 w-3 mr-1.5"
                                    aria-hidden="true"
                                  />
                                  {noticeTypeConfig.label}
                                </Badge>
                                {notice.is_urgent && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs font-black animate-pulse shadow-sm px-3 py-1.5"
                                  >
                                    Urgent
                                  </Badge>
                                )}
                                {!notice.ward_id && notice.is_public && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs gap-1.5 font-bold border-2 px-3 py-1"
                                  >
                                    <Globe
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Public
                                  </Badge>
                                )}
                                {notice.ward_id && wardNumber && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs gap-1.5 font-bold border-2 px-3 py-1"
                                  >
                                    <Pin
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Ward {wardNumber}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-black text-sm sm:text-base hover:text-primary transition-colors leading-snug">
                                {notice.title}
                              </h4>
                              <AnimatePresence mode="wait">
                                {isExpanded ? (
                                  <motion.p
                                    key="expanded"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm text-muted-foreground mt-2.5 leading-relaxed font-medium"
                                  >
                                    {notice.content.substring(0, 200)}...
                                  </motion.p>
                                ) : (
                                  <motion.p
                                    key="collapsed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium"
                                  >
                                    {notice.excerpt ||
                                      notice.content.substring(0, 100)}
                                    ...
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex flex-col items-end gap-2.5 ml-5 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <Calendar
                                  className="h-3 w-3 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap font-bold">
                                  {formatDate(notice.published_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900/30 focus-visible:ring-2 focus-visible:ring-amber-500 transition-all rounded-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmark(notice.id);
                                  }}
                                  aria-label={
                                    isBookmarked
                                      ? "Remove bookmark"
                                      : "Add bookmark"
                                  }
                                >
                                  <Bookmark
                                    className={cn(
                                      "h-4 w-4 transition-all duration-300",
                                      isBookmarked
                                        ? "fill-current text-amber-500"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all rounded-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(notice);
                                  }}
                                  aria-label="Share notice"
                                >
                                  <Share2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-border gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-primary transition-colors font-bold"
                          >
                            <Link href={`/citizen/notices/${notice.id}`}>
                              Read Full Notice
                              <ChevronRight
                                className="ml-1.5 h-4 w-4"
                                aria-hidden="true"
                              />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNotice(isExpanded ? null : notice.id);
                            }}
                            className="font-bold border-2"
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>

        {notices.length > 0 && (
          <CardFooter className="border-t-2 border-border px-5 py-4">
            <Button
              variant="outline"
              className="w-full bg-transparent hover:bg-primary/10 transition-all font-black border-2"
              asChild>
              <Link href="/citizen/notices">
                View All Notices
                <Newspaper className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}