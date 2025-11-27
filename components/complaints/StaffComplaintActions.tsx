// components/complaints/StaffComplaintActions.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';

interface StaffComplaintActionsProps {
  complaint: {
    id: string;
    status: string;
    assigned_staff_id: string | null;
    resolution_notes: string | null;
  };
}

export function StaffComplaintActions({ complaint }: StaffComplaintActionsProps) {
  const [status, setStatus] = useState(complaint.status);
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaint.id);

      if (error) throw error;

      // Also add to status history
      const { error: historyError } = await supabase
        .from('complaint_status_history')
        .insert({
          complaint_id: complaint.id,
          old_status: status,
          new_status: newStatus,
          changed_by_user_id: (await supabase.auth.getUser()).data.user?.id!,
          note: `Status changed to ${newStatus}`,
        });

      if (historyError) throw historyError;

      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResolutionNotes = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('complaints')
        .update({ resolution_notes: resolutionNotes })
        .eq('id', complaint.id);

      if (error) throw error;

      alert('Resolution notes saved.');
    } catch (error) {
      console.error('Error saving resolution notes:', error);
      alert('Error saving resolution notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canResolve = ['assigned', 'in_progress', 'received'].includes(status);
  const canClose = status === 'resolved';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Actions</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status
          </label>
          <ComplaintStatusBadge status={status} size="lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <div className="flex flex-wrap gap-2">
            {canResolve && (
              <button
                type="button"
                onClick={() => handleStatusChange('resolved')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Mark Resolved
              </button>
            )}
            {canClose && (
              <button
                type="button"
                onClick={() => handleStatusChange('closed')}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Close Complaint
              </button>
            )}
            {status === 'submitted' && (
              <button
                type="button"
                onClick={() => handleStatusChange('received')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Mark Received
              </button>
            )}
            {status === 'received' && (
              <button
                type="button"
                onClick={() => handleStatusChange('assigned')}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Mark Assigned
              </button>
            )}
            {status === 'assigned' && (
              <button
                type="button"
                onClick={() => handleStatusChange('in_progress')}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Start Progress
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Notes
          </label>
          <textarea
            id="resolutionNotes"
            rows={4}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add resolution notes here..."
          />
          <button
            type="button"
            onClick={handleSaveResolutionNotes}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}