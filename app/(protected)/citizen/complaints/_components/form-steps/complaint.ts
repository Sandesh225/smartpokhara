import { 
  CheckCircle2, Clock, FileText, Loader2, RefreshCw, User, XCircle, AlertCircle 
} from "lucide-react";

export const COMPLAINT_STATUS_CONFIG = {
  received: { label: "Received", color: "bg-blue-500", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 },
  assigned: { label: "Assigned", color: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-200", icon: User },
  under_review: { label: "Under Review", color: "bg-purple-500", text: "text-purple-700", border: "border-purple-200", icon: FileText },
  in_progress: { label: "In Progress", color: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", icon: Loader2 },
  resolved: { label: "Resolved", color: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-slate-500", text: "text-slate-700", border: "border-slate-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500", text: "text-red-700", border: "border-red-200", icon: XCircle },
  reopened: { label: "Reopened", color: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", icon: RefreshCw },
};

export const COMPLAINT_PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-600 bg-slate-50 border-slate-200" },
  medium: { label: "Medium", color: "text-blue-700 bg-blue-50 border-blue-200" },
  high: { label: "High", color: "text-orange-700 bg-orange-50 border-orange-200" },
  critical: { label: "Critical", color: "text-red-700 bg-red-50 border-red-200" },
};