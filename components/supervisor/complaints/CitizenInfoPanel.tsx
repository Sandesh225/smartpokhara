import { User, Phone, Mail, MapPin } from "lucide-react";

interface CitizenInfoPanelProps {
  citizen: any;
}

export function CitizenInfoPanel({ citizen }: CitizenInfoPanelProps) {
  if (!citizen) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Citizen Details</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {citizen.profile?.full_name || citizen.full_name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500">
              {citizen.email || "No email provided"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {citizen.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{citizen.phone}</span>
            </div>
          )}
          {citizen.email && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{citizen.email}</span>
            </div>
          )}
          {/* Mock data for now if not in DB query */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>Ward {citizen.profile?.ward_number || "N/A"}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">History</span>
            <span className="font-medium text-blue-600 hover:underline cursor-pointer">
              View 5 previous complaints
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}