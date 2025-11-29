// app/(protected)/admin/complaints/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/role-helpers';
import { createClient } from '@/lib/supabase/server';
import { ComplaintDetailsHeader } from "@/components/citizen/complaints/ComplaintDetailsHeader";
import { ComplaintTimeline } from "@/components/citizen/complaints/ComplaintTimeline";
import { ComplaintAttachments } from "@/components/citizen/complaints/ComplaintAttachments";
import { InternalComments } from '@/components/complaints/InternalComments';
import { AdminComplaintActions } from '@/components/complaints/admin/AdminComplaintActions';
import { EscalationHistory } from '@/components/complaints/admin/EscalationHistory';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user)) {
    redirect('/citizen/dashboard');
  }

  const supabase = await createClient();

  try {
    // Fetch complaint details for admin
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select(`
        *,
        category:complaint_categories(*),
        subcategory:complaint_subcategories(*),
        ward:wards(*),
        department:departments(*),
        assigned_staff:users(id, email, user_profiles(full_name)),
        citizen:users(id, email, user_profiles(full_name))
      `)
      .eq('id', id)
      .single();

    if (error || !complaint) {
      console.error('Complaint not found:', error);
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900">Complaint Not Found</h1>
            <p className="mt-2 text-gray-600">
              The complaint you are looking for does not exist.
            </p>
            <div className="mt-4">
              <a
                href="/admin/complaints"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to Complaints
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Fetch status history
    const { data: statusHistory } = await supabase
      .from('complaint_status_history')
      .select(`
        *,
        changed_by_user:users(id, email, user_profiles(full_name))
      `)
      .eq('complaint_id', id)
      .order('changed_at', { ascending: true });

    // Fetch attachments
    const { data: attachments } = await supabase
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', id)
      .order('uploaded_at', { ascending: false });

    // Fetch internal comments
    const { data: internalComments } = await supabase
      .from('complaint_internal_comments')
      .select(`
        *,
        user:users(id, email, user_profiles(full_name))
      `)
      .eq('complaint_id', id)
      .order('created_at', { ascending: false });

    // Fetch escalation history
    const { data: escalations } = await supabase
      .from('complaint_escalations')
      .select(`
        *,
        escalated_by_user:users(id, email, user_profiles(full_name)),
        escalated_to_user:users(id, email, user_profiles(full_name)),
        escalated_to_department:departments(name)
      `)
      .eq('complaint_id', id)
      .order('escalated_at', { ascending: false });

    // Fetch departments and staff for assignment
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name, head_user_id')
      .eq('is_active', true);

    const { data: staffUsers } = await supabase
      .from('users')
      .select(`
        id,
        email,
        user_profiles(full_name)
      `)
      .in('id', (
        await supabase
          .from('user_roles')
          .select('user_id')
          .in('role_id', (
            await supabase
              .from('roles')
              .select('id')
              .in('role_type', ['admin', 'dept_head', 'dept_staff', 'ward_staff', 'field_staff', 'call_center'])
          ).data?.map(r => r.id) || [])
      ).data?.map(ur => ur.user_id) || []);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin - Complaint Management</h1>
              <p className="mt-2 text-gray-600">
                Tracking Code: <span className="font-mono">{complaint.tracking_code}</span>
              </p>
            </div>
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Admin View
            </div>
          </div>
        </div>

        <ComplaintDetailsHeader complaint={complaint} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Actions */}
            <AdminComplaintActions 
              complaint={complaint}
              departments={departments || []}
              staffUsers={staffUsers || []}
            />

            {/* Complaint Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Complaint Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{complaint.address_text}</p>
                  {complaint.landmark && (
                    <p className="mt-1 text-sm text-gray-900">Landmark: {complaint.landmark}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
              {statusHistory && statusHistory.length > 0 ? (
                <ComplaintTimeline timeline={statusHistory} />
              ) : (
                <p className="text-gray-500 text-center py-4">No status history available.</p>
              )}
            </div>

            {/* Escalation History */}
            {escalations && escalations.length > 0 && (
              <EscalationHistory escalations={escalations} />
            )}

            {/* Internal Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Internal Comments</h2>
              <InternalComments
                complaintId={id}
                comments={internalComments || []}
              />
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Attachments</h2>
              <ComplaintAttachments
                complaintId={id}
                attachments={attachments || []}
                canUpload={true}
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Complaint Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Complaint Information</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tracking Code</dt>
                  <dd className="text-sm text-gray-900">{complaint.tracking_code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(complaint.submitted_at).toLocaleDateString()} at{' '}
                    {new Date(complaint.submitted_at).toLocaleTimeString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">SLA Due Date</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(complaint.sla_due_at).toLocaleDateString()}
                    {new Date(complaint.sla_due_at) < new Date() && (
                      <span className="ml-2 text-xs text-red-600">(Overdue)</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="text-sm text-gray-900 capitalize">
                    {complaint.source.replace('_', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Citizen</dt>
                  <dd className="text-sm text-gray-900">
                    {complaint.citizen?.user_profiles?.full_name || complaint.citizen?.email}
                  </dd>
                </div>
                {complaint.resolution_notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Resolution Notes</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                      {complaint.resolution_notes}
                    </dd>
                  </div>
                )}
                {complaint.rejection_reason && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                    <dd className="text-sm text-gray-900">{complaint.rejection_reason}</dd>
                  </div>
                )}
                {complaint.citizen_satisfaction_rating && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Citizen Rating</dt>
                    <dd className="text-sm text-gray-900">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < complaint.citizen_satisfaction_rating! ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      {complaint.citizen_feedback && (
                        <p className="mt-1 text-xs text-gray-600">
                          Feedback: {complaint.citizen_feedback}
                        </p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading complaint:', error);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900">Error Loading Complaint</h1>
          <p className="mt-2 text-gray-600">
            There was an error loading the complaint. Please try again.
          </p>
        </div>
      </div>
    );
  }
}