"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  RefreshCw,
  UserPlus,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  link: string;
  type: string;
}

const activityIcons: Record<string, React.ElementType> = {
  assignment: UserPlus,
  resolution: CheckCircle,
  comment: MessageSquare,
  escalation: AlertTriangle,
  update: FileText,
  status_change: RefreshCw,
  new_report: FileText,
  default: Activity,
};

/**
 * STRICT TOKEN-ONLY THEME
 * No Tailwind palette colors allowed.
 * Only global CSS tokens.
 */
const activityTheme: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  assignment: {
    bg: "bg-primary/10",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  resolution: {
    bg: "bg-secondary/20",
    text: "text-secondary",
    badge: "bg-secondary/20 text-secondary",
  },
  comment: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  escalation: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  update: {
    bg: "bg-muted/60",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  status_change: {
    bg: "bg-info-blue/10",
    text: "text-info-blue",
    badge: "bg-info-blue/10 text-info-blue",
  },
  new_report: {
    bg: "bg-success-green/10",
    text: "text-success-green",
    badge: "bg-success-green/10 text-success-green",
  },
  default: {
    bg: "bg-primary/10",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
};

export function ActivityFeed({
  initialActivity,
}: {
  initialActivity: ActivityItem[];
}) {
  const [activities] = useState(initialActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
      setError("Sync failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
              <Activity className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Live Activity
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time system logs
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw
              className={cn("h-3 w-3", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 p-2 rounded-lg border border-border">
            <AlertTriangle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 border border-border">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Quiet in here...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              New activity from your department will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((item) => {
              const IconComponent =
                activityIcons[item.type] || activityIcons.default;
              const theme =
                activityTheme[item.type] || activityTheme.default;

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className="block px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    
                    <div
                      className={cn(
                        "mt-0.5 h-10 w-10 rounded-lg flex items-center justify-center border border-border",
                        theme.bg,
                        theme.text
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(item.timestamp),
                            { addSuffix: true }
                          )}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-border" />

                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-md border border-border",
                            theme.badge
                          )}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="p-3 border-t border-border bg-muted/20">
          <button className="w-full py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            View All Department Activity
          </button>
        </div>
      )}
    </div>
  );
}