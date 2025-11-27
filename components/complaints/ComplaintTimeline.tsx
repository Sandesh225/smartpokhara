// components/complaints/ComplaintTimeline.tsx
'use client';

import { ComplaintStatusBadge } from './ComplaintStatusBadge';

interface TimelineItem {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by_user_id: string;
  note: string | null;
  changed_at: string;
  changed_by?: {
    profile?: {
      full_name: string;
    };
    email: string;
  };
}

interface ComplaintTimelineProps {
  timeline: TimelineItem[];
}

export function ComplaintTimeline({ timeline }: ComplaintTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {itemIdx !== timeline.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <span className="text-white text-sm font-medium">
                      {itemIdx + 1}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Status changed from{' '}
                      {item.old_status ? (
                        <ComplaintStatusBadge status={item.old_status as any} size="sm" />
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}{' '}
                      to <ComplaintStatusBadge status={item.new_status as any} size="sm" />
                    </p>
                    {item.note && (
                      <p className="mt-1 text-sm text-gray-700">{item.note}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      By {item.changed_by?.profile?.full_name || item.changed_by?.email || 'System'}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(item.changed_at).toLocaleDateString()} at{' '}
                    {new Date(item.changed_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}