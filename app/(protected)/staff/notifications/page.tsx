"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useNotificationMutations } from "@/features/notifications";
import { useCurrentUser } from "@/features/users";
import { formatRelativeTime } from "@/lib/utils/format";
import { Bell, CheckCircle, RefreshCw, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffNotificationsPage() {
  const { data: user } = useCurrentUser();
  const {
    data: notifications = [],
    isLoading: loading,
    refetch,
  } = useNotifications(user?.id);

  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
      case "invitation":
        return { icon: "bg-success-green/10 text-success-green border-success-green/20", dot: "bg-success-green" };
      case "warning":
        return { icon: "bg-warning-amber/10 text-warning-amber border-warning-amber/20", dot: "bg-warning-amber" };
      case "error":
        return { icon: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" };
      case "assignment":
        return { icon: "bg-info-blue/10 text-info-blue border-info-blue/20", dot: "bg-info-blue" };
      default:
        return { icon: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };
    }
  };

  const groupedNotifications = useMemo(() => {
    const today: typeof notifications = [];
    const yesterday: typeof notifications = [];
    const older: typeof notifications = [];

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    notifications.forEach((n) => {
      const date = new Date(n.created_at);
      if (date >= todayStart) {
        today.push(n);
      } else if (date >= yesterdayStart) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  }, [notifications]);

  const handleNotificationClick = async (notification: {
    id: string;
    is_read: boolean | null;
    action_url: string | null;
  }) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }
  };

  const renderNotificationGroup = (
    title: string,
    items: typeof notifications
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground/50 px-1 uppercase tracking-wider border-l-2 border-border pl-4">
          {title}
        </h3>
        <div className="space-y-3">
          {items.map((notification) => {
            const style = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-5 p-5 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-[0.99]",
                  !notification.is_read
                    ? "bg-info-blue/5 border-info-blue/20 ring-1 ring-info-blue/10"
                    : "bg-card border-border hover:bg-muted/30"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0",
                    style.icon
                  )}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-foreground uppercase tracking-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground mt-1 line-clamp-2 uppercase tracking-tighter leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0 mt-3 shadow-xs",
                          style.dot
                        )}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    {notification.action_url && (
                      <Link
                        href={notification.action_url}
                        className="text-xs font-black text-primary hover:underline uppercase tracking-tighter"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Launch Action →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1200px] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground uppercase">Notifications</h1>
          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            Stay updated on your municipal tasks and assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black text-xs px-3 py-1 uppercase tracking-widest">{unreadCount} unread</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 bg-muted/50 border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => user?.id && markAllAsRead.mutateAsync(user.id)}
              className="gap-2 bg-muted/50 border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xs"
            >
              <CheckCircle className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border p-6">
          <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-foreground">
            <Bell className="h-4 w-4 text-info-blue" />
            Notification Broadcasts
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Click on a notification to acknowledge and mark as read.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-muted/40 animate-pulse rounded-2xl border border-border"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-6">
               <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center border border-border shadow-inner group">
                <Inbox className="h-10 w-10 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-widest">Inbox Zero</p>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-60">
                    You're all caught up! No recent alerts found.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {renderNotificationGroup("Recent Activity", groupedNotifications.today)}
              {renderNotificationGroup(
                "Yesterday",
                groupedNotifications.yesterday
              )}
              {renderNotificationGroup("Archive", groupedNotifications.older)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
