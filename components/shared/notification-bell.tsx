"use client"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle } from "lucide-react"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"/ui/
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/ui/dropdown/ui/nu"
import { useStaffNotifications } from "@/lib/hooks/use-complaints"
import { formatRelativeTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useStaffNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
      case "invitation":
        return "🟢"
      case "warning":
        return "🟡"
      case "error":
        return "🔴"
      default:
        return "🔵"
    }
  }

  const handleNotificationClick = async (notification: {
    id: string
    action_url: string | null
  }) => {
    await markAsRead(notification.id)
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-4 cursor-pointer border-b last:border-b-0",
                  !notification.is_read && "bg-blue-50 dark:bg-blue-950/20",
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 text-lg">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.created_at)}</p>
                  </div>
                  {!notification.is_read && <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
