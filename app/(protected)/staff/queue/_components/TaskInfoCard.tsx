import {
  MapPin,
  Calendar,
  UserCheck,
  FileText,
  Image,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface TaskInfoCardProps {
  assignment: {
    title: string;
    description: string;
    location: string;
    coordinates?: any;
    ward: string;
    assigned_at: string;
    due_at?: string | null;
    assigned_by_name: string;
    instructions?: string;
    attachments?: Array<{
      id: string;
      file_path: string;
      file_name: string;
      file_type: string | null;
      created_at: string;
    }>;
  };
}

export function TaskInfoCard({ assignment }: TaskInfoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Description
        </h3>
        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {assignment.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Due Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {assignment.due_at
                  ? format(new Date(assignment.due_at), "PPP p")
                  : "No Deadline"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Assigned By</p>
              <p className="text-sm font-semibold text-gray-900">
                {assignment.assigned_by_name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Location</p>
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                {assignment.location || "N/A"}
              </p>
              {assignment.ward !== "N/A" && (
                <span className="inline-block mt-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                  {assignment.ward}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {assignment.instructions && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
            Supervisor Instructions
          </p>
          <p className="text-sm text-gray-800 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            {assignment.instructions}
          </p>
        </div>
      )}

      {/* Citizen Attachments Section */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Citizen Attachments ({assignment.attachments.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assignment.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <img
                  src={attachment.file_path}
                  alt={attachment.file_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                    <ExternalLink className="h-5 w-5 text-white" />
                    <span className="text-[10px] text-white font-medium">
                      View Full Size
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
