// components/complaints/admin/EscalationHistory.tsx
'use client';

interface Escalation {
  id: string;
  reason: string;
  sla_breached: boolean;
  escalated_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
  escalated_by_user: { 
    id: string; 
    email: string; 
    user_profiles: { full_name: string } | null 
  } | null;
  escalated_to_user: { 
    id: string; 
    email: string; 
    user_profiles: { full_name: string } | null 
  } | null;
  escalated_to_department: { 
    name: string 
  } | null;
}

interface EscalationHistoryProps {
  escalations: Escalation[];
}

export function EscalationHistory({ escalations }: EscalationHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Escalation History</h2>
      <div className="space-y-4">
        {escalations.map((escalation) => (
          <div
            key={escalation.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">
                  Escalated {new Date(escalation.escalated_at).toLocaleDateString()}
                </h3>
                <p className="text-sm text-gray-600">
                  By: {escalation.escalated_by_user?.user_profiles?.full_name || escalation.escalated_by_user?.email || 'System'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {escalation.sla_breached && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    SLA Breached
                  </span>
                )}
                {escalation.resolved_at ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Active
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              <strong>Reason:</strong> {escalation.reason}
            </p>

            {escalation.escalated_to_user && (
              <p className="text-sm text-gray-600">
                <strong>Escalated To:</strong>{' '}
                {escalation.escalated_to_user.user_profiles?.full_name || escalation.escalated_to_user.email}
              </p>
            )}

            {escalation.escalated_to_department && (
              <p className="text-sm text-gray-600">
                <strong>Escalated To Department:</strong> {escalation.escalated_to_department.name}
              </p>
            )}

            {escalation.resolved_at && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Resolved:</strong> {new Date(escalation.resolved_at).toLocaleDateString()}
                </p>
                {escalation.resolution_note && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Resolution Note:</strong> {escalation.resolution_note}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}