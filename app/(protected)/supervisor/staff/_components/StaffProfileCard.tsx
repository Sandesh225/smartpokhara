import { User, Phone, Mail, MapPin, Calendar, Star } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";

interface StaffProfileCardProps {
  staff: any; // Using loose typing for flexibility with join results
}

export function StaffProfileCard({ staff }: StaffProfileCardProps) {
  const joinDate = staff.created_at ? format(new Date(staff.created_at), "MMM yyyy") : "N/A";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
          {staff.avatar_url ? (
            <img
              src={staff.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
          <div className="h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            {staff.performance_rating?.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {staff.full_name}
            </h1>
            <StatusBadge status={staff.availability_status} variant="staff" />
          </div>
          <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
            {staff.role?.replace(/_/g, " ")}
            {staff.staff_code && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
                {staff.staff_code}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          {staff.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${staff.email}`} className="hover:text-blue-600">
                {staff.email}
              </a>
            </div>
          )}
          {staff.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${staff.phone}`} className="hover:text-blue-600">
                {staff.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Joined {joinDate}</span>
          </div>
          {/* Location mock */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {staff.ward_number
                ? `Ward ${staff.ward_number} - ${staff.ward_name}`
                : "Municipality HQ"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Block (Desktop) */}
      <div className="hidden lg:flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold">Workload</p>
          <p className="text-xl font-bold text-blue-600">
            {staff.current_workload}
          </p>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
          <p className="text-xl font-bold text-gray-600">
            {staff.max_concurrent_assignments}
          </p>
        </div>
      </div>
    </div>
  );
}