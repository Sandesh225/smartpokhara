// components/complaints/admin/AdminComplaintActions.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ComplaintStatusBadge } from "../../citizen/complaints/ComplaintStatusBadge";

interface AdminComplaintActionsProps {
  complaint: {
    id: string;
    status: string;
    priority: string;
    assigned_department_id: string | null;
    assigned_staff_id: string | null;
    resolution_notes: string | null;
    rejection_reason: string | null;
  };
  departments: Array<{ id: string; name: string; head_user_id: string }>;
  staffUsers: Array<{ id: string; email: string; user_profiles: { full_name: string } | null }>;
}

export function AdminComplaintActions({ complaint, departments, staffUsers }: AdminComplaintActionsProps) {
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [assignedDepartmentId, setAssignedDepartmentId] = useState(complaint.assigned_department_id || '');
  const [assignedStaffId, setAssignedStaffId] = useState(complaint.assigned_staff_id || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || '');
  const [rejectionReason, setRejectionReason] = useState(complaint.rejection_reason || '');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignment');
  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaint.id);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('complaint_status_history')
        .insert({
          complaint_id: complaint.id,
          old_status: status,
          new_status: newStatus,
          changed_by_user_id: (await supabase.auth.getUser()).data.user?.id!,
          note: `Admin manually changed status to ${newStatus}`,
        });

      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('complaints')
        .update({ priority })
        .eq('id', complaint.id);

      if (error) throw error;

      alert('Priority updated successfully.');
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Error updating priority. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentUpdate = async () => {
    try {
      setLoading(true);

      const updates: any = {};
      if (assignedDepartmentId) updates.assigned_department_id = assignedDepartmentId;
      if (assignedStaffId) updates.assigned_staff_id = assignedStaffId;

      const { error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', complaint.id);

      if (error) throw error;

      alert('Assignment updated successfully.');
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('complaints')
        .update({ 
          resolution_notes: resolutionNotes,
          rejection_reason: rejectionReason 
        })
        .eq('id', complaint.id);

      if (error) throw error;

      alert('Notes saved successfully.');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      setLoading(true);

      // Create escalation record
      const { error: escalationError } = await supabase
        .from('complaint_escalations')
        .insert({
          complaint_id: complaint.id,
          escalated_by_user_id: (await supabase.auth.getUser()).data.user?.id!,
          reason: 'Manually escalated by administrator',
          escalated_at: new Date().toISOString(),
        });

      if (escalationError) throw escalationError;

      // Update complaint status
      const { error: complaintError } = await supabase
        .from('complaints')
        .update({ 
          status: 'escalated',
          is_escalated: true,
          escalated_at: new Date().toISOString()
        })
        .eq('id', complaint.id);

      if (complaintError) throw complaintError;

      // Add to status history
      await supabase
        .from('complaint_status_history')
        .insert({
          complaint_id: complaint.id,
          old_status: status,
          new_status: 'escalated',
          changed_by_user_id: (await supabase.auth.getUser()).data.user?.id!,
          note: 'Manually escalated by administrator',
        });

      setStatus('escalated');
      alert('Complaint escalated successfully.');
    } catch (error) {
      console.error('Error escalating complaint:', error);
      alert('Error escalating complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaffUsers = assignedDepartmentId 
    ? staffUsers.filter(user => {
        const department = departments.find(dept => dept.id === assignedDepartmentId);
        return department && user.id === department.head_user_id;
      })
    : staffUsers;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'assignment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignment
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'status'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Status & Priority
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resolution Notes
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'escalation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Escalation
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Assignment Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Department
                </label>
                <select
                  id="department"
                  value={assignedDepartmentId}
                  onChange={(e) => {
                    setAssignedDepartmentId(e.target.value);
                    setAssignedStaffId(''); // Reset staff when department changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Staff
                </label>
                <select
                  id="staff"
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {filteredStaffUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.user_profiles?.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAssignmentUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Assignment'}
            </button>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status & Priority Control</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status: <ComplaintStatusBadge status={status as any} size="sm" />
                </label>
                <div className="space-y-2">
                  {['pending', 'received', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleStatusChange(statusOption)}
                      disabled={loading || status === statusOption}
                      className="w-full px-3 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {['low', 'medium', 'high', 'critical'].map((priorityOption) => (
                    <button
                      key={priorityOption}
                      onClick={() => setPriority(priorityOption)}
                      className={`w-full px-3 py-2 text-left border rounded-md ${
                        priority === priorityOption
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {priorityOption.charAt(0).toUpperCase() + priorityOption.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePriorityChange}
                  disabled={loading || priority === complaint.priority}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Priority
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Resolution & Rejection Notes</h3>
            
            <div>
              <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes
              </label>
              <textarea
                id="resolutionNotes"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add detailed resolution notes..."
              />
            </div>

            <div>
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason (if applicable)
              </label>
              <input
                type="text"
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for rejection..."
              />
            </div>

            <button
              onClick={handleSaveNotes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}

        {activeTab === 'escalation' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Escalation Management</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Escalating a complaint will change its status to "escalated" 
                and notify relevant authorities. Use this feature for complaints that require 
                immediate attention or higher-level intervention.
              </p>
            </div>

            <button
              onClick={handleEscalate}
              disabled={loading || status === 'escalated'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Escalating...' : 'Escalate Complaint'}
            </button>

            {status === 'escalated' && (
              <p className="text-sm text-green-600">
                This complaint has already been escalated.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}