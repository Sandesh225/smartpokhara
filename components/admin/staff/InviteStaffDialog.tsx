// components/admin/staff/InviteStaffDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Copy, Check, Mail, Loader2 } from "lucide-react";
import { EmailService } from "@/lib/email/email-service";

interface InviteStaffDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteStaffDialog({ onClose, onSuccess }: InviteStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role_type: "dept_staff" as any,
  });

  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("roles")
      .select("*")
      .in("role_type", ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"])
      .eq("is_active", true)
      .order("role_type");

    if (data) setRoles(data);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Get current user for inviter name
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', userData?.user?.id)
        .single();

      const inviterName = profileData?.full_name || 'Admin';

      // Step 1: Create invitation
      const { data, error: inviteError } = await supabase.rpc("invite_staff_member", {
        p_email: formData.email,
        p_full_name: formData.full_name,
        p_phone: formData.phone || null,
        p_role_type: formData.role_type,
      });

      if (inviteError) throw inviteError;

      setInvitationLink(data.invitation_link);

      // Step 2: Send email
      setSendingEmail(true);
      const emailSuccess = await EmailService.sendInvitation({
        recipientEmail: formData.email,
        recipientName: formData.full_name,
        inviterName: inviterName,
        role: formData.role_type,
        invitationLink: data.invitation_link,
        expiresAt: new Date(data.expires_at),
      });

      setEmailSent(emailSuccess);

      if (!emailSuccess) {
        console.warn("Email sending failed, but invitation was created");
      }

    } catch (err: any) {
      console.error("Error inviting staff:", err);
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
      setSendingEmail(false);
    }
  };

  const handleCopy = async () => {
    if (invitationLink) {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Success state
  if (invitationLink) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
          
          <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                {emailSent ? <Check className="h-6 w-6 text-green-600" /> : <Mail className="h-6 w-6 text-yellow-600" />}
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Invitation Created!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {emailSent 
                  ? `✓ Email sent to ${formData.email}`
                  : `⚠️ Invitation created but email failed. Share the link manually.`
                }
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationLink}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This invitation expires in 7 days.
              </p>
            </div>

            <button
              onClick={onSuccess}
              className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Invite Staff Member</h3>
            <p className="mt-1 text-sm text-gray-500">Send an invitation email to a new staff member</p>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977-XXXXXXXXX"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  name="role_type"
                  required
                  value={formData.role_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.role_type}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || sendingEmail}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(loading || sendingEmail) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {sendingEmail ? "Sending Email..." : loading ? "Creating..." : "Send Invitation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}