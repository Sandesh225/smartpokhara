"use client";

import {
  User,
  Phone,
  Mail,
  Shield,
  MessageSquare,
  Clock,
  History,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CitizenInfoPanelProps {
  citizen: any;
  isAnonymous?: boolean;
}

export function CitizenInfoPanel({
  citizen,
  isAnonymous,
}: CitizenInfoPanelProps) {
  if (isAnonymous) {
    return (
      <Card className="border-border/60 shadow-sm bg-muted/10">
        <CardHeader className="bg-muted/30 px-4 py-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Citizen Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-background">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="font-bold text-foreground">Anonymous Report</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
            The reporter has chosen to remain anonymous. No contact details are
            available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayName = citizen?.full_name || "Unknown Citizen";
  const displayEmail = citizen?.email || "No email";
  const displayPhone = citizen?.phone || "No phone";
  const hasContact = !!(citizen?.email || citizen?.phone);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 px-4 py-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Citizen Profile
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 bg-gradient-to-b from-background to-muted/20">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={citizen?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground truncate text-sm">
                {displayName}
              </h4>
              <Badge
                variant="secondary"
                className="mt-1 text-[10px] font-medium bg-green-50 text-green-700 border-green-200"
              >
                Verified Account
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Email
                </p>
                <p className="text-xs font-medium text-foreground truncate select-all">
                  {displayEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-xs font-medium text-foreground select-all">
                  {displayPhone}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700"
              disabled={!hasContact}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs h-9">
              <History className="w-3.5 h-3.5 mr-2" />
              History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}