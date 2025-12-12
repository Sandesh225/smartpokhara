import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";

interface RelatedComplaint {
  id: string;
  tracking_code: string;
  title: string;
  status: string;
  created_at: string;
}

interface RelatedComplaintsProps {
  complaints: RelatedComplaint[];
}

export function RelatedComplaints({ complaints }: RelatedComplaintsProps) {
  if (complaints.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Related Complaints</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {complaints.map((comp) => (
          <Link 
            key={comp.id} 
            href={`/supervisor/complaints/${comp.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-blue-600">{comp.tracking_code}</span>
              <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comp.created_at))} ago</span>
            </div>
            <p className="text-sm text-gray-900 truncate mb-2">{comp.title}</p>
            <StatusBadge status={comp.status} variant="complaint" className="scale-90 origin-left" />
          </Link>
        ))}
      </div>
    </div>
  );
}