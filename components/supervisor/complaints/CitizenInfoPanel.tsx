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

/**
 * Displays verified citizen information or anonymous status.
 */
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
              <p className="text-sm text-slate-600 leading-relaxed">
                The citizen has requested privacy. Contact details are restricted.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = citizen?.full_name || "Citizen (Name Missing)";
  const displayEmail = citizen?.email || "No email available";
  const displayPhone = citizen?.phone || "No phone available";
  const avatarUrl = citizen?.avatar_url;
  const hasContact = !!(citizen?.email || citizen?.phone);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/80 to-white">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          Citizen Information
        </h3>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-2 ring-blue-50">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-900 text-lg truncate leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
               <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                ✓ Verified Account
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4 opacity-50" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Email</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{displayEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-slate-700">{displayPhone}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <Button
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
            disabled={!hasContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Private Message
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-600 font-bold h-11 hover:bg-slate-50"
          >
            <Info className="w-4 h-4 mr-2" />
            Full History
          </Button>
        </div>
      </div>
    </div>
  );
}