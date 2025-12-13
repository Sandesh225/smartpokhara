"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  CheckCircle2, 
  Calendar 
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
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.profile_photo_url || ""} alt={profile.full_name} className="object-cover" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{profile.full_name}</h2>
                  {profile.full_name_nepali && (
                    <p className="text-sm text-muted-foreground font-medium">{profile.full_name_nepali}</p>
                  )}
                </div>
                <Button onClick={onEdit} variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.is_verified ? (
                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified Citizen
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    Unverified
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>Your verified contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium">{profile.phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Details</CardTitle>
            <CardDescription>Your registered residence location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div>
                  <p className="text-xs text-muted-foreground">Ward No.</p>
                  <p className="text-sm font-medium text-primary">Ward {profile.ward_id ? "wait..." : "N/A"}</p>
                  {/* Note: ward_id needs mapping to actual number in real app */}
                </div>
                {(profile.address_line1 || profile.address_line2) && (
                  <div>
                    <p className="text-xs text-muted-foreground mt-2">Street Address</p>
                    <p className="text-sm">{profile.address_line1}</p>
                    {profile.address_line2 && <p className="text-sm">{profile.address_line2}</p>}
                  </div>
                )}
                {profile.landmark && (
                  <div>
                    <p className="text-xs text-muted-foreground mt-2">Landmark</p>
                    <p className="text-sm">{profile.landmark}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}