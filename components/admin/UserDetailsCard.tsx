"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface UserDetailsProps {
  user: any;
}

export function UserDetailsCard({ user }: UserDetailsProps) {
  const profile = user.user_profiles;

  // Fix hydration mismatch by only formatting dates on client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format dates safely (only on client after mount)
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || !mounted) return "N/A";

    try {
      // Use consistent format that matches server/client
      return format(new Date(dateString), "PPP"); // e.g., "December 29, 2024"
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString || !mounted) return "Never";

    try {
      return format(new Date(dateString), "PPP 'at' p"); // e.g., "December 29, 2024 at 3:45 PM"
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "Invalid date";
    }
  };

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
              {mounted ? (
                formatDate(user.created_at)
              ) : (
                <span className="animate-pulse bg-gray-200 h-5 w-32 rounded" />
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Last Login
            </label>
            <div className="text-sm">
              {mounted ? (
                formatDateTime(user.last_login_at)
              ) : (
                <span className="animate-pulse bg-gray-200 h-5 w-32 rounded" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}