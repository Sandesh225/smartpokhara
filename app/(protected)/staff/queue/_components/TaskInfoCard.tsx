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
    <div className="bg-card rounded-xl shadow-xs border border-border p-5 space-y-5">
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Description
        </h3>
        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {assignment.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Due Date</p>
              <p className="text-sm font-bold text-foreground">
                {assignment.due_at
                  ? format(new Date(assignment.due_at), "PPP p")
                  : "No Deadline"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Assigned By</p>
              <p className="text-sm font-bold text-foreground">
                {assignment.assigned_by_name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Location</p>
              <p className="text-sm font-bold text-foreground line-clamp-2">
                {assignment.location || "N/A"}
              </p>
              {assignment.ward !== "N/A" && (
                <span className="inline-block mt-1 text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-bold border border-border uppercase">
                  {assignment.ward}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {assignment.instructions && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-bold text-warning-amber uppercase mb-2 tracking-widest flex items-center gap-1.5">
            <div className="w-1 h-3 bg-warning-amber rounded-full" />
            Supervisor Instructions
          </p>
          <div className="text-sm text-foreground bg-warning-amber/5 p-4 rounded-xl border border-warning-amber/10 font-medium leading-relaxed italic">
            "{assignment.instructions}"
          </div>
        </div>
      )}

      {/* Citizen Attachments Section */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Image className="w-3.5 h-3.5" />
            Citizen Attachments ({assignment.attachments.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assignment.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <img
                  src={attachment.file_path}
                  alt={attachment.file_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                    <ExternalLink className="h-5 w-5 text-white" />
                    <span className="text-xs text-white font-medium">
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
