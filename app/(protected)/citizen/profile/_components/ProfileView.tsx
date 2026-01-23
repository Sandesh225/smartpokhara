"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  CheckCircle2,
  Calendar,
  Home,
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
      {/* Header Card */}
      <Card>
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start -mt-16">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={profile.profile_photo_url || ""}
                  alt={profile.full_name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {profile.is_verified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-background rounded-full p-1"
                  title="Verified Citizen"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1 pt-4 sm:pt-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {profile.full_name}
                  </h1>
                  {profile.full_name_nepali && (
                    <p className="text-muted-foreground">
                      {profile.full_name_nepali}
                    </p>
                  )}
                </div>
                <Button onClick={onEdit} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge
                  variant={profile.is_verified ? "default" : "secondary"}
                  className="gap-1"
                >
                  {profile.is_verified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </>
                  ) : (
                    "Unverified"
                  )}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(profile.created_at), "MMM yyyy")}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Contact Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Mobile Number
                </p>
                <p className="text-sm font-medium font-mono">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ward</p>
                <p className="text-sm font-medium">
                  {profile.ward_number
                    ? `Ward ${profile.ward_number} - ${profile.ward_name}`
                    : "Not assigned"}
                </p>
                {profile.ward_name_nepali && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile.ward_name_nepali}
                  </p>
                )}
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Residential Address
                </p>
                {profile.address_line1 || profile.address_line2 ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {profile.address_line1}
                    </p>
                    {profile.address_line2 && (
                      <p className="text-sm text-muted-foreground">
                        {profile.address_line2}
                      </p>
                    )}
                    {profile.landmark && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Near: {profile.landmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No address provided
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}