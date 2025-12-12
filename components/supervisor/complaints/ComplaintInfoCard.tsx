import { MapPin, User, Phone, Mail, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplaintInfoCardProps {
  complaint: any;
}

export function ComplaintInfoCard({ complaint }: ComplaintInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {complaint.title}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {complaint.category?.name}
              </span>
              {complaint.subcategory && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {complaint.subcategory}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 mb-6">
          <p>{complaint.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          {/* Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Location Details
            </h3>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ward {complaint.ward?.ward_number}, {complaint.ward?.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {complaint.address_text || "No specific address provided"}
                </p>
                {complaint.location_point && (
                  <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    View on Map
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Citizen */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Submitted By
            </h3>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {complaint.citizen?.profile?.full_name || "Anonymous Citizen"}
                </p>
                <div className="flex flex-col gap-1 mt-1">
                  {complaint.citizen?.phone && (
                    <a href={`tel:${complaint.citizen.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600">
                      <Phone className="h-3 w-3" />
                      {complaint.citizen.phone}
                    </a>
                  )}
                  {complaint.citizen?.email && (
                    <a href={`mailto:${complaint.citizen.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600">
                      <Mail className="h-3 w-3" />
                      {complaint.citizen.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}