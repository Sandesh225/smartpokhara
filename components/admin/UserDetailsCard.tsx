"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

interface UserDetailsProps {
  user: any;
}

export function UserDetailsCard({ user }: UserDetailsProps) {
  const profile = user.user_profiles;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Profile Details
          </div>
          <div className="flex gap-2">
            <Badge variant={user.is_active ? "default" : "destructive"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {user.is_verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Full Name
            </label>
            <div className="flex items-center gap-2 font-medium">
              {profile?.full_name || "N/A"}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              {user.email}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              {user.phone || "N/A"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Auth Provider
            </label>
            <div className="flex items-center gap-2 capitalize">
              <Shield className="h-4 w-4 text-gray-400" />
              {user.external_auth_provider || "email"}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Joined Date
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Last Login
            </label>
            <div className="text-sm">
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Never"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}