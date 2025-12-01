"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Clock, CheckCircle, XCircle, Copy, RotateCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Invitation {
  id: string;
  email: string;
  full_name: string;
  role_type: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  invitation_token: string;
}

interface Props {
  onRefresh: () => void;
}

export function StaffInvitationsTable({ onRefresh }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("staff_invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading invitations:", error);
    } else {
      setInvitations(data || []);
    }
    
    setLoading(false);
  };

  const handleCopyLink = async (invitation: Invitation) => {
    const link = `${window.location.origin}/staff/accept-invitation?token=${invitation.invitation_token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invitation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResend = async (id: string) => {
    const supabase = createClient();
    
    try {
      await supabase.rpc("resend_staff_invitation", { p_invitation_id: id });
      alert("Invitation resent successfully!");
      loadInvitations();
      onRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to resend invitation");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    
    const supabase = createClient();
    
    try {
      await supabase.rpc("cancel_staff_invitation", { p_invitation_id: id });
      loadInvitations();
      onRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to cancel invitation");
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.is_used) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          <CheckCircle className="h-3 w-3" />
          Accepted
        </span>
      );
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <XCircle className="h-3 w-3" />
          Expired
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by inviting a new staff member.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invitee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invitations.map((invitation) => (
            <tr key={invitation.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {invitation.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invitation.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {invitation.role_type.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(invitation)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleCopyLink(invitation)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Copy invitation link"
                  >
                    {copiedId === invitation.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  
                  {!invitation.is_used && new Date(invitation.expires_at) > new Date() && (
                    <button
                      onClick={() => handleResend(invitation.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Resend invitation"
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>
                  )}
                  
                  {!invitation.is_used && (
                    <button
                      onClick={() => handleCancel(invitation.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Cancel invitation"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}