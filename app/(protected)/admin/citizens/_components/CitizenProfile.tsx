// ═══════════════════════════════════════════════════════════
// app/admin/citizens/_components/CitizenProfile.tsx
// ═══════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { CitizenProfile } from "@/features/users/types";
import { User, MapPin, Phone, Mail, BadgeCheck } from "lucide-react";

export default function CitizenProfileCard({
  profile,
}: {
  profile: CitizenProfile;
}) {
  return (
    <div className="stone-card p-4 md:p-6 h-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-lg flex-shrink-0">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-black text-foreground flex items-center gap-2 truncate">
              <span className="truncate">{profile.full_name}</span>
              {profile.is_verified && (
                <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
              )}
            </h2>
            {profile.full_name_nepali && (
              <p className="text-sm text-muted-foreground font-serif truncate">
                {profile.full_name_nepali}
              </p>
            )}
          </div>
        </div>

        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs md:text-sm font-bold border self-start sm:self-auto flex-shrink-0",
            profile.is_active
              ? "bg-success-green/10 text-success-green border-success-green/30"
              : "bg-error-red/10 text-error-red border-error-red/30"
          )}
        >
          {profile.is_active ? "Active" : "Suspended"}
        </span>
      </div>

      {/* CONTACT INFO */}
      <div className="grid grid-cols-1 gap-3 text-sm mb-6">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg md:rounded-xl">
          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate">{profile.email}</span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg md:rounded-xl">
          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {profile.phone || "No phone provided"}
          </span>
        </div>

        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg md:rounded-xl">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {profile.address_line1 || "No address"}
            </p>
            {profile.ward_id && (
              <p className="text-xs text-muted-foreground">
                Ward No. {profile.ward_id}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* METADATA */}
      <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs md:text-xs text-muted-foreground uppercase tracking-wider font-bold">
            Citizenship No
          </p>
          <p className="font-mono text-sm md:text-base text-foreground mt-1 truncate">
            {profile.citizenship_number || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs md:text-xs text-muted-foreground uppercase tracking-wider font-bold">
            User ID
          </p>
          <p
            className="font-mono text-foreground text-xs mt-1 truncate"
            title={profile.user_id}
          >
            {profile.user_id.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}
