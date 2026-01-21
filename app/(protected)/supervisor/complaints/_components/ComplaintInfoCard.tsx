import { MapPin, Navigation, Tag, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ComplaintInfoCardProps {
  complaint: any;
}

export function ComplaintInfoCard({ complaint }: ComplaintInfoCardProps) {
  const hasCoordinates = complaint.location_point?.coordinates;

  return (
    <div className="bg-card">
      {/* HEADER SECTION */}
      <div className="px-4 sm:px-5 md:px-6 py-4 md:py-5 border-b border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold px-2.5 md:px-3 py-0.5 md:py-1 text-xs"
          >
            {complaint.category?.name}
          </Badge>

          {complaint.subcategory && (
            <Badge
              variant="outline"
              className="text-muted-foreground bg-background border-border font-medium text-xs"
            >
              {complaint.subcategory.name}
            </Badge>
          )}

          <span className="text-[10px] md:text-xs text-muted-foreground ml-auto flex items-center gap-1.5 flex-shrink-0">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">
              {format(new Date(complaint.submitted_at), "PPP 'at' p")}
            </span>
            <span className="sm:hidden">
              {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
            </span>
          </span>
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
          {complaint.title}
        </h2>
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-6">
        {/* DESCRIPTION SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 md:h-5 bg-primary rounded-full" />
            <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Description
            </h4>
          </div>
          <div className="bg-muted rounded-lg md:rounded-xl p-4 md:p-5 text-foreground text-sm md:text-base leading-relaxed whitespace-pre-wrap border border-border">
            {complaint.description}
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* LOCATION CARD */}
          <div className="group p-4 md:p-5 rounded-lg md:rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-success-green/10 border border-success-green/20 flex items-center justify-center text-success-green group-hover:scale-110 transition-transform duration-200">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm md:text-base font-bold text-foreground mb-1">
                  Ward {complaint.ward?.ward_number}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">
                  {complaint.ward?.name}
                </p>

                {complaint.address_text && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 md:mb-3">
                    {complaint.address_text}
                  </p>
                )}

                {hasCoordinates && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 md:h-8 text-xs font-semibold text-success-green border-success-green/30 hover:bg-success-green/10"
                  >
                    <Navigation className="h-3 w-3 mr-1.5" />
                    <span className="hidden sm:inline">View on Map</span>
                    <span className="sm:hidden">Map</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* DEPARTMENT CARD */}
          <div className="group p-4 md:p-5 rounded-lg md:rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-200">
                <Tag className="h-4 w-4 md:h-5 md:w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  Department
                </p>
                <p className="text-sm md:text-base font-bold text-foreground mb-1 truncate">
                  {complaint.department?.name || "Unassigned"}
                </p>
                <p className="text-xs text-muted-foreground mb-2 md:mb-3 truncate">
                  Category: {complaint.category?.name}
                </p>

                {!complaint.department && (
                  <div className="flex items-center gap-1.5 text-xs text-warning-amber bg-warning-amber/10 px-2 py-1 rounded-md w-fit border border-warning-amber/20">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Pending Assignment</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}