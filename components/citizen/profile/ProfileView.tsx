"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  CheckCircle2,
  CalendarDays,
  Building2,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import type { UserProfile } from "@/lib/supabase/queries/profile";

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 elevation-2 rounded-3xl bg-white">
        <div className="h-40 w-full bg-gradient-to-r from-[rgb(43,95,117)] to-[rgb(95,158,160)] relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <CardContent className="card-padding relative">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="-mt-20 relative">
              <div className="rounded-full p-1.5 bg-white elevation-3">
                <Avatar className="h-36 w-36 border-4 border-white">
                  <AvatarImage
                    src={profile.profile_photo_url || ""}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-[rgb(244,245,247)] text-[rgb(26,32,44)]/40 font-black">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {profile.is_verified && (
                <div
                  className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 elevation-2"
                  title="Verified Citizen"
                >
                  <CheckCircle2 className="h-7 w-7 text-[rgb(95,158,160)] fill-[rgb(95,158,160)]/10" />
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-8 flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-[rgb(26,32,44)] tracking-tight">
                    {profile.full_name}
                  </h1>
                  {profile.full_name_nepali && (
                    <p className="text-xl text-[rgb(26,32,44)]/60 mt-1 font-semibold">
                      {profile.full_name_nepali}
                    </p>
                  )}
                </div>
                <Button
                  onClick={onEdit}
                  className="bg-[rgb(43,95,117)] hover:bg-[rgb(43,95,117)]/90 rounded-2xl h-12 px-6 font-bold elevation-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <Badge
                  variant={profile.is_verified ? "default" : "secondary"}
                  className={
                    profile.is_verified
                      ? "bg-[rgb(95,158,160)]/10 text-[rgb(95,158,160)] hover:bg-[rgb(95,158,160)]/20 border-2 border-[rgb(95,158,160)]/20 rounded-xl px-4 py-1.5 font-bold"
                      : "rounded-xl px-4 py-1.5 font-bold"
                  }
                >
                  {profile.is_verified
                    ? "Verified Citizen"
                    : "Unverified Account"}
                </Badge>
                <div className="flex items-center text-sm text-[rgb(26,32,44)]/60 font-mono">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Joined {format(new Date(profile.created_at), "MMMM yyyy")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="elevation-1 h-full rounded-3xl border-2 border-slate-100 bg-white">
          <CardContent className="card-padding">
            <h3 className="font-black text-lg mb-8 flex items-center gap-3 text-[rgb(26,32,44)]">
              <span className="p-2 bg-[rgb(43,95,117)]/10 text-[rgb(43,95,117)] rounded-2xl">
                <Mail className="h-5 w-5" />
              </span>
              Contact Information
            </h3>

            <div className="space-y-8">
              <div className="group flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-[rgb(244,245,247)] flex items-center justify-center text-[rgb(26,32,44)]/60 group-hover:text-[rgb(43,95,117)] group-hover:bg-[rgb(43,95,117)]/10 transition-all">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 mb-1.5">
                    Email Address
                  </p>
                  <p className="text-base font-bold text-[rgb(26,32,44)]">
                    {profile.email}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="group flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-[rgb(244,245,247)] flex items-center justify-center text-[rgb(26,32,44)]/60 group-hover:text-[rgb(43,95,117)] group-hover:bg-[rgb(43,95,117)]/10 transition-all">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 mb-1.5">
                    Mobile Number
                  </p>
                  <p className="text-base font-mono font-bold text-[rgb(26,32,44)]">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 h-full rounded-3xl border-2 border-slate-100 bg-white">
          <CardContent className="card-padding">
            <h3 className="font-black text-lg mb-8 flex items-center gap-3 text-[rgb(26,32,44)]">
              <span className="p-2 bg-[rgb(95,158,160)]/10 text-[rgb(95,158,160)] rounded-2xl">
                <MapPin className="h-5 w-5" />
              </span>
              Location Details
            </h3>

            <div className="space-y-8">
              <div className="group flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-[rgb(244,245,247)] flex items-center justify-center text-[rgb(26,32,44)]/60 group-hover:text-[rgb(95,158,160)] group-hover:bg-[rgb(95,158,160)]/10 transition-all">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 mb-1.5">
                    Administrative Ward
                  </p>
                  <p className="text-base font-bold text-[rgb(26,32,44)]">
                    {profile.ward_id
                      ? `Ward No. ${profile.ward_id}`
                      : "Not Assigned"}
                  </p>
                  <p className="text-xs text-[rgb(26,32,44)]/50 mt-1 font-medium">
                    Your primary administrative division
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="group flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-[rgb(244,245,247)] flex items-center justify-center text-[rgb(26,32,44)]/60 group-hover:text-[rgb(95,158,160)] group-hover:bg-[rgb(95,158,160)]/10 transition-all">
                  <Navigation className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 mb-1.5">
                    Residential Address
                  </p>
                  {profile.address_line1 || profile.address_line2 ? (
                    <div className="space-y-1.5">
                      <p className="text-base font-bold text-[rgb(26,32,44)]">
                        {profile.address_line1}
                      </p>
                      {profile.address_line2 && (
                        <p className="text-sm text-[rgb(26,32,44)]/70 font-medium">
                          {profile.address_line2}
                        </p>
                      )}
                      {profile.landmark && (
                        <p className="text-sm text-[rgb(26,32,44)]/50 italic mt-2">
                          Near: {profile.landmark}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(26,32,44)]/40 italic">
                      No address provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
