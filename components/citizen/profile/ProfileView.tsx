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
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden border-none shadow-md bg-white">
        {/* Decorative Background */}
        <div className="h-32 w-full bg-linear-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar - Negative margin to pull it up */}
            <div className="-mt-12 relative">
              <div className="rounded-full p-1 bg-white shadow-sm">
                <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                  <AvatarImage
                    src={profile.profile_photo_url || ""}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-slate-100 text-slate-400 font-medium">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {profile.is_verified && (
                <div
                  className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm"
                  title="Verified Citizen"
                >
                  <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="mt-4 md:mt-6 flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {profile.full_name}
                  </h1>
                  {profile.full_name_nepali && (
                    <p className="text-lg text-slate-500 font-serif">
                      {profile.full_name_nepali}
                    </p>
                  )}
                </div>
                <Button onClick={onEdit} className="shadow-sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <Badge
                  variant={profile.is_verified ? "default" : "secondary"}
                  className={
                    profile.is_verified
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                      : ""
                  }
                >
                  {profile.is_verified
                    ? "Verified Citizen"
                    : "Unverified Account"}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Joined {format(new Date(profile.created_at), "MMMM yyyy")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <Card className="shadow-sm h-full">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                <Mail className="h-4 w-4" />
              </span>
              Contact Information
            </h3>

            <div className="space-y-6">
              <div className="group flex items-start gap-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-0.5">
                    Email Address
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {profile.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="group flex items-start gap-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-0.5">
                    Mobile Number
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Info Card */}
        <Card className="shadow-sm h-full">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <MapPin className="h-4 w-4" />
              </span>
              Location Details
            </h3>

            <div className="space-y-6">
              <div className="group flex items-start gap-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-0.5">
                    Administrative Ward
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {profile.ward_id
                      ? `Ward No. ${profile.ward_id}`
                      : "Not Assigned"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your primary administrative division
                  </p>
                </div>
              </div>

              <Separator />

              <div className="group flex items-start gap-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                  <Navigation className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-0.5">
                    Residential Address
                  </p>
                  {profile.address_line1 || profile.address_line2 ? (
                    <div className="space-y-1">
                      <p className="text-base font-medium text-slate-900">
                        {profile.address_line1}
                      </p>
                      {profile.address_line2 && (
                        <p className="text-sm text-slate-600">
                          {profile.address_line2}
                        </p>
                      )}
                      {profile.landmark && (
                        <p className="text-sm text-slate-500 italic mt-1">
                          Near: {profile.landmark}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
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