import { CitizenProfile } from "@/types/admin-citizens";
import { User, MapPin, Phone, Mail, BadgeCheck } from "lucide-react";

export default function CitizenProfile({
  profile,
}: {
  profile: CitizenProfile;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {profile.full_name}
              {profile.is_verified && (
                <BadgeCheck className="w-5 h-5 text-blue-500" />
              )}
            </h2>
            {profile.full_name_nepali && (
              <p className="text-sm text-gray-500 font-serif">
                {profile.full_name_nepali}
              </p>
            )}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            profile.is_active
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {profile.is_active ? "Active Account" : "Suspended"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{profile.email}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{profile.phone || "No phone provided"}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium">
              {profile.address_line1 || "No address"}
            </p>
            {profile.ward_id && (
              <p className="text-xs text-gray-500">
                Ward No. {profile.ward_id}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Citizenship No
          </p>
          <p className="font-mono text-gray-900 mt-1">
            {profile.citizenship_number || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            User ID
          </p>
          <p
            className="font-mono text-gray-900 text-xs mt-1 truncate"
            title={profile.user_id}
          >
            {profile.user_id}
          </p>
        </div>
      </div>
    </div>
  );
}
