"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
} from "lucide-react"

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
import { toast } from "sonner"

interface Notice {
  id: string
  title: string
  excerpt: string
  content: string
  notice_type: string
  ward_id: string | null
  is_public: boolean
  is_urgent: boolean
  published_at: string
  created_at: string
}

interface RecentNoticesProps {
  notices: Notice[]
  wardNumber: number | null
  loading?: boolean
}

const NOTICE_TYPE_CONFIG: Record<
  string,
  {
    label: string
    icon: React.ComponentType<any>
    color: string
    bgColor: string
  }
> = {
  announcement: {
    label: "Announcement",
    icon: Bell,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  maintenance: {
    label: "Maintenance",
    icon: Building,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  event: {
    label: "Event",
    icon: Calendar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  payment: {
    label: "Payment",
    icon: Bell,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  public_service: {
    label: "Public Service",
    icon: Globe,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
}

export default function RecentNotices({ notices, wardNumber, loading = false }: RecentNoticesProps) {
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null)
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Set<string>>(new Set())

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getNoticeTypeConfig = (noticeType: string) => {
    return (
      NOTICE_TYPE_CONFIG[noticeType] || {
        label: noticeType,
        icon: Newspaper,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      }
    )
  }

  const handleBookmark = (noticeId: string) => {
    const newBookmarks = new Set(bookmarkedNotices)
    if (newBookmarks.has(noticeId)) {
      newBookmarks.delete(noticeId)
      toast.info("Notice removed from bookmarks")
    } else {
      newBookmarks.add(noticeId)
      toast.success("Notice bookmarked")
    }
    setBookmarkedNotices(newBookmarks)
  }

  const handleShare = async (notice: Notice) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: notice.title,
          text: notice.excerpt,
          url: `${window.location.origin}/citizen/notices/${notice.id}`,
        })
      } catch (error) {
        console.log("Sharing cancelled")
      }
    } else {
      navigator.clipboard.writeText(
        `${notice.title}\n${notice.excerpt}\n${window.location.origin}/citizen/notices/${notice.id}`,
      )
      toast.success("Link copied to clipboard")
    }
  }

  if (loading) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border border-border shadow-md" role="region" aria-label="Recent notices">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Notices</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">
                  Updates for {wardNumber ? `Ward ${wardNumber}` : "your area"}
                </p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <AnimatePresence>
              {notices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center px-4"
                >
                  <div className="p-4 bg-muted rounded-2xl mb-4">
                    <Newspaper className="h-12 w-12 text-muted-foreground/60" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No notices available</h3>
                  <p className="text-muted-foreground text-sm">Check back later for updates</p>
                </motion.div>
              ) : (
                <div className="divide-y" role="list">
                  {notices.map((notice, index) => {
                    const noticeTypeConfig = getNoticeTypeConfig(notice.notice_type)
                    const NoticeTypeIcon = noticeTypeConfig.icon
                    const isBookmarked = bookmarkedNotices.has(notice.id)
                    const isExpanded = expandedNotice === notice.id

                    return (
                      <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="p-4 hover:bg-muted/50 transition-colors"
                        role="listitem"
                      >
                        <div
                          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                          onClick={() => setExpandedNotice(isExpanded ? null : notice.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setExpandedNotice(isExpanded ? null : notice.id)
                            }
                          }}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge
                                  className={`${noticeTypeConfig.bgColor} ${noticeTypeConfig.color} border-0 font-medium`}
                                >
                                  <NoticeTypeIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                                  {noticeTypeConfig.label}
                                </Badge>
                                {notice.is_urgent && (
                                  <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                                    Urgent
                                  </Badge>
                                )}
                                {!notice.ward_id && notice.is_public && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Globe className="h-3 w-3" aria-hidden="true" />
                                    Public
                                  </Badge>
                                )}
                                {notice.ward_id && wardNumber && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Pin className="h-3 w-3" aria-hidden="true" />
                                    Ward {wardNumber}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold hover:text-primary transition-colors">{notice.title}</h4>
                              <AnimatePresence mode="wait">
                                {isExpanded ? (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-muted-foreground mt-2 leading-relaxed"
                                  >
                                    {notice.content.substring(0, 200)}...
                                  </motion.p>
                                ) : (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                                  >
                                    {notice.excerpt || notice.content.substring(0, 100)}...
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notice.published_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookmark(notice.id)
                                  }}
                                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                >
                                  <Bookmark
                                    className={`h-3.5 w-3.5 transition-colors ${isBookmarked ? "fill-current text-amber-500" : "text-muted-foreground"}`}
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShare(notice)
                                  }}
                                  aria-label="Share notice"
                                >
                                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t gap-2">
                          <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <Link href={`/citizen/notices/${notice.id}`}>
                              Read Full Notice
                              <ChevronRight className="ml-1 h-3 w-3" aria-hidden="true" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedNotice(isExpanded ? null : notice.id)
                            }}
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>

        {notices.length > 0 && (
          <CardFooter className="border-t px-4 py-3">
            <Button variant="outline" className="w-full bg-transparent hover:bg-primary/5 transition-colors" asChild>
              <Link href="/citizen/notices">
                View All Notices
                <Newspaper className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
