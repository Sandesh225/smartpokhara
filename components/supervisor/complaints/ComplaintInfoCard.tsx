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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50/80 to-white">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold px-3 py-1 text-xs"
          >
            {complaint.category?.name}
          </Badge>
          {complaint.subcategory && (
            <Badge
              variant="outline"
              className="text-gray-600 bg-white border-gray-200 font-medium text-xs"
            >
              {complaint.subcategory.name}
            </Badge>
          )}
          <span className="text-xs text-gray-500 ml-auto flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(complaint.submitted_at), "PPP 'at' p")}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {complaint.title}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Description Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Description
            </h4>
          </div>
          <div className="bg-linear-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
            {complaint.description}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Card */}
          <div className="group p-5 rounded-xl border border-gray-200 bg-linear-to-br from-emerald-50/50 to-white hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-base font-bold text-gray-900 mb-1">
                  Ward {complaint.ward?.ward_number}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {complaint.ward?.name}
                </p>

                {complaint.address_text && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {complaint.address_text}
                  </p>
                )}

                {hasCoordinates && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Navigation className="h-3 w-3 mr-1.5" />
                    View on Map
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Department Card */}
          <div className="group p-5 rounded-xl border border-gray-200 bg-linear-to-br from-purple-50/50 to-white hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-200">
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Department
                </p>
                <p className="text-base font-bold text-gray-900 mb-1">
                  {complaint.department?.name || "Unassigned"}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Category: {complaint.category?.name}
                </p>
                {!complaint.department && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Pending Assignment
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
