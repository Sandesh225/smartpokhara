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

const activityColors: Record<string, string> = {
  assignment: "from-blue-100 to-indigo-100 text-blue-600",
  resolution: "from-green-100 to-emerald-100 text-green-600",
  comment: "from-purple-100 to-pink-100 text-purple-600",
  escalation: "from-red-100 to-orange-100 text-red-600",
  update: "from-gray-100 to-gray-200 text-gray-600",
  default: "from-blue-100 to-indigo-100 text-blue-600",
};

export function ActivityFeed({ initialActivity }: { initialActivity: ActivityItem[] }) {
  const [activities, setActivities] = useState(initialActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      // TODO: Replace with real API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError("Failed to refresh activity feed");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h3>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded px-2 py-1"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</p>
            <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
              Activity will appear here as your team works on complaints.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((item) => {
              const IconComponent = activityIcons[item.type] || activityIcons.default;
              const colorClass = activityColors[item.type] || activityColors.default;

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-1 h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                        colorClass
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <button className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors w-full text-center">
            Load more activity
          </button>
        </div>
      )}
    </div>
  );
}
