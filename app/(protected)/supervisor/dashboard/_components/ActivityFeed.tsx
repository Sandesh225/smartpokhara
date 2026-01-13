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
  FileText
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
  default: Activity,
};

// Refactored to use semantic theme variables
const activityTheme: Record<string, { bg: string, text: string }> = {
  assignment: { bg: "bg-blue-500/15", text: "text-blue-500" },
  resolution: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  comment: { bg: "bg-purple-500/15", text: "text-purple-500" },
  escalation: { bg: "bg-destructive/15", text: "text-destructive" },
  update: { bg: "bg-muted/50", text: "text-muted-foreground" },
  default: { bg: "bg-primary/15", text: "text-primary" },
};

export function ActivityFeed({ initialActivity }: { initialActivity: ActivityItem[] }) {
  const [activities, setActivities] = useState(initialActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // API call logic would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError("Sync failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="stone-card h-full flex flex-col overflow-hidden shadow-xl border-border/40">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-border/50 bg-linear-to-b from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Live Activity</h3>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Real-time system logs</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-destructive bg-destructive/10 p-2 rounded-lg">
            <AlertTriangle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card/30">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-foreground">Quiet in here...</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              New activity from your department will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {activities.map((item) => {
              const IconComponent = activityIcons[item.type] || activityIcons.default;
              const theme = activityTheme[item.type] || activityTheme.default;

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className="block px-6 py-4 hover:bg-muted/40 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                      theme.bg,
                      theme.text
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground/60">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-muted border border-border/50", theme.text)}>
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

      {/* Footer Load More */}
      {activities.length > 0 && (
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <button className="w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            View All Department Activity
          </button>
        </div>
      )}
    </div>
  );
}