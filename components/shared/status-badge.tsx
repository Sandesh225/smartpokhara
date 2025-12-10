import { Badge } from "@/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    assigned: "bg-purple-100 text-purple-800",
    in_progress: "bg-amber-100 text-amber-800",
    resolved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={styles[status] || "bg-gray-100"} variant="outline">
      {status.replace("_", " ")}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    low: "outline",
    medium: "secondary",
    high: "destructive",
    urgent: "destructive",
    critical: "destructive",
  };

  return <Badge variant={styles[priority] || "secondary"}>{priority}</Badge>;
}
