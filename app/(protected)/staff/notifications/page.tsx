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
        return { icon: "bg-green-100 text-green-600", dot: "bg-green-500" };
      case "warning":
        return { icon: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500" };
      case "error":
        return { icon: "bg-red-100 text-red-600", dot: "bg-red-500" };
      case "assignment":
        return { icon: "bg-blue-100 text-blue-600", dot: "bg-blue-500" };
      default:
        return { icon: "bg-gray-100 text-gray-600", dot: "bg-gray-500" };
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
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">
          {title}
        </h3>
        <div className="space-y-2">
          {items.map((notification) => {
            const style = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                  !notification.is_read
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className={cn(
                    " w-10 h-10 rounded-full flex items-center justify-center",
                    style.icon
                  )}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0 mt-2",
                          style.dot
                        )}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    {notification.action_url && (
                      <Link
                        href={notification.action_url}
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View details
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on your tasks and assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => user?.id && markAllAsRead.mutateAsync(user.id)}
              className="gap-2 bg-transparent"
            >
              <CheckCircle className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
          <CardDescription>
            Click on a notification to mark it as read
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up! Check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderNotificationGroup("Today", groupedNotifications.today)}
              {renderNotificationGroup(
                "Yesterday",
                groupedNotifications.yesterday
              )}
              {renderNotificationGroup("Older", groupedNotifications.older)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
