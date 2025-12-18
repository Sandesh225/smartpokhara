import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
  awaiting_approval: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  paused: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  available: "bg-green-100 text-green-800 border-green-200",
  busy: "bg-amber-100 text-amber-800 border-amber-200",
  off_duty: "bg-gray-200 text-gray-600 border-gray-300",
  on_leave: "bg-purple-100 text-purple-800 border-purple-200"
};

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase();
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wider", styles[key] || styles.not_started)}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}