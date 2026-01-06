"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  AlertOctagon,
  FileBadge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoticeCardProps {
  notice: any;
  variant?: "default" | "compact";
}

export default function NoticeCard({ notice, variant = "default" }: NoticeCardProps) {
  // Mapping notice types to Machhapuchhre Modern palette
  const getStatusColor = (type: string, urgent: boolean) => {
    if (urgent) return "text-[rgb(var(--error-red))] bg-[rgb(var(--error-red)/0.1)] border-[rgb(var(--error-red)/0.2)]";
    switch (type) {
      case "event": return "text-[rgb(var(--primary-brand))] bg-[rgb(var(--primary-brand)/0.1)] border-[rgb(var(--primary-brand)/0.2)]";
      case "tender": return "text-[rgb(var(--text-ink))] bg-[rgb(var(--neutral-stone-200))] border-[rgb(var(--neutral-stone-300))]";
      default: return "text-[rgb(var(--accent-nature-dark))] bg-[rgb(var(--accent-nature)/0.15)] border-[rgb(var(--accent-nature)/0.2)]";
    }
  };

  return (
    <div className={cn(
      "stone-card group transition-all duration-300 hover:shadow-lg hover:border-[rgb(var(--primary-brand)/0.3)] relative overflow-hidden",
      !notice.is_read && "ring-2 ring-[rgb(var(--primary-brand)/0.2)] bg-[rgb(var(--neutral-stone-50))]"
    )}>
      {/* Status Bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 z-10",
        notice.is_urgent ? "bg-[rgb(var(--error-red))]" : "bg-[rgb(var(--primary-brand))]"
      )} />

      <div className="p-6 pl-8 flex flex-col h-full gap-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {notice.is_urgent && (
            <Badge className="bg-[rgb(var(--error-red))] text-white border-0 hover:bg-[rgb(var(--error-red))] animate-pulse px-3 py-1 shadow-md shadow-red-200">
              <AlertOctagon className="w-3 h-3 mr-1.5" /> URGENT
            </Badge>
          )}
          
          <Badge variant="outline" className={cn("capitalize font-bold border", getStatusColor(notice.notice_type, false))}>
            {notice.notice_type?.replace('_', ' ')}
          </Badge>

          {!notice.is_read && (
            <Badge className="bg-[rgb(var(--highlight-tech))] text-white border-0 hover:bg-[rgb(var(--highlight-tech-dark))]">
              New
            </Badge>
          )}

          <div className="ml-auto flex items-center gap-1 text-[11px] font-bold text-[rgb(var(--neutral-stone-400))] tabular-nums">
             <Clock className="w-3 h-3" />
             {format(new Date(notice.published_at), "MMM d")}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Link href={`/citizen/notices/${notice.id}`} className="block">
            <h3 className="text-xl font-bold text-[rgb(var(--text-ink))] leading-tight group-hover:text-[rgb(var(--primary-brand))] transition-colors">
              {notice.title}
            </h3>
          </Link>
          <p className="text-[rgb(var(--neutral-stone-500))] text-sm leading-relaxed line-clamp-2">
             {notice.excerpt || notice.content.substring(0, 140).replace(/<[^>]*>?/gm, '')}...
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[rgb(var(--neutral-stone-200))] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-medium text-[rgb(var(--neutral-stone-500))]">
            {notice.ward_number ? (
               <span className="flex items-center gap-1.5 bg-[rgb(var(--neutral-stone-100))] px-2 py-1 rounded-md">
                 <MapPin className="w-3.5 h-3.5 text-[rgb(var(--primary-brand))]" />
                 Ward {notice.ward_number}
               </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[rgb(var(--neutral-stone-100))] px-2 py-1 rounded-md">
                 <MapPin className="w-3.5 h-3.5 text-[rgb(var(--accent-nature))]" />
                 Public
               </span>
            )}
            <span className="hidden sm:flex items-center gap-1.5 text-[rgb(var(--neutral-stone-400))]">
              <FileBadge className="w-3.5 h-3.5" /> {notice.id.substring(0,6)}
            </span>
          </div>

          <Button 
            asChild 
            size="sm" 
            className="rounded-xl font-bold bg-white text-[rgb(var(--text-ink))] border border-[rgb(var(--neutral-stone-200))] hover:bg-[rgb(var(--primary-brand))] hover:text-white hover:border-[rgb(var(--primary-brand))] transition-all shadow-sm group/btn"
          >
            <Link href={`/citizen/notices/${notice.id}`}>
              Details <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}