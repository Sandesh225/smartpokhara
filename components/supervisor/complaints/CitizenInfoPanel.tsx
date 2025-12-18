"use client";

import {
  User,
  Phone,
  Mail,
  Shield,
  Info,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/80 to-white">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Citizen Information
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-linear-to-br from-slate-50 to-slate-100/50 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Anonymous Submission
              </p>
              <p className="text-sm text-slate-600">
                Personal details are protected for privacy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = citizen?.full_name || "Unknown Citizen";
  const displayEmail = citizen?.email || "Not provided";
  const displayPhone = citizen?.phone || "Not provided";
  const avatarUrl = citizen?.avatar_url;
  const hasContact = citizen?.email || citizen?.phone;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/80 to-white">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          Citizen Information
        </h3>
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-2 ring-gray-100">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-lg truncate leading-tight">
              {displayName}
            </p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 mt-2 uppercase tracking-wide">
              ✓ Verified
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 -mx-1">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-0.5">
                Email Address
              </p>
              <p className="font-medium text-gray-900 truncate text-sm">
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 -mx-1">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-0.5">
                Phone Number
              </p>
              <p className="font-medium text-gray-900 text-sm">
                {displayPhone}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-sm font-semibold h-10 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
            disabled={!hasContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-sm font-semibold h-10 hover:bg-gray-50 transition-all"
          >
            <Info className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
