import {
  CheckCircle,
  Circle,
  Clock,
  User,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TimelineEvent {
  id: string;
  new_status: string;
  old_status: string | null;
  created_at: string;
  note: string;
  changed_by: string;
}

interface StatusTimelineProps {
  history: TimelineEvent[];
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-purple-100 text-purple-800 border-purple-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  reopened: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  new: <Circle className="h-3 w-3" />,
  in_progress: <Clock className="h-3 w-3" />,
  pending: <AlertCircle className="h-3 w-3" />,
  resolved: <CheckCircle className="h-3 w-3" />,
  closed: <CheckCircle className="h-3 w-3" />,
  reopened: <AlertCircle className="h-3 w-3" />,
};

export function StatusTimeline({ history }: StatusTimelineProps) {
  // Sort history newest first
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Group events by date
  const groupedEvents: { [key: string]: TimelineEvent[] } = {};

  sortedHistory.forEach((event) => {
    const date = format(new Date(event.created_at), "yyyy-MM-dd");
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Activity Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track all status changes and updates on this complaint
        </p>
      </CardHeader>
      <CardContent>
        {sortedHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-3 rounded-full bg-muted p-3 inline-block">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No activity recorded</h3>
            <p className="text-sm text-muted-foreground">
              Status changes and updates will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {format(new Date(date), "MMM d, yyyy")}
                  </span>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                  {events.map((event, idx) => (
                    <div key={event.id} className="relative pl-8">
                      <div className="absolute left-0 top-1 flex items-center justify-center">
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                            idx === 0
                              ? "border-primary bg-primary/10"
                              : "border-muted-foreground/30 bg-background"
                          )}
                        >
                          {idx === 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1",
                                statusColors[event.new_status] ||
                                  "bg-gray-100 text-gray-800"
                              )}
                            >
                              {statusIcons[event.new_status] || (
                                <Circle className="h-3 w-3" />
                              )}
                              {formatStatus(event.new_status)}
                            </Badge>

                            {event.old_status && (
                              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                <ArrowRight className="h-3 w-3" />
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-transparent"
                                >
                                  {formatStatus(event.old_status)}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.created_at), "h:mm a")}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>
                              Updated by {event.changed_by || "System"}
                            </span>
                          </div>

                          {event.note && (
                            <div className="text-sm bg-muted/50 rounded-lg p-3 mt-2">
                              <p className="whitespace-pre-wrap">
                                {event.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
