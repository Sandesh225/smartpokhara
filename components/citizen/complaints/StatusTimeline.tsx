// components/citizen/complaints/StatusTimeline.tsx
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  User,
  UserCheck,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import type { ComplaintStatusHistory, Complaint } from '@/lib/supabase/queries/complaints';

interface StatusTimelineProps {
  complaint: Complaint;
  updates: ComplaintStatusHistory[];
  isSubscribed?: boolean;
}

// Status configuration
const statusConfig = {
  received: {
    label: 'Received',
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Complaint received and logged in system',
  },
  under_review: {
    label: 'Under Review',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    description: 'Being reviewed by municipal staff',
  },
  assigned: {
    label: 'Assigned',
    icon: UserCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Assigned to department for resolution',
  },
  in_progress: {
    label: 'In Progress',
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Work has started on the complaint',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Issue has been resolved',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle2,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    description: 'Complaint is officially closed',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Complaint was not accepted',
  },
  reopened: {
    label: 'Reopened',
    icon: RefreshCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Complaint has been reopened',
  },
};

// Order of status progression
const statusOrder = [
  'received',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
  'rejected',
  'reopened',
];

export function StatusTimeline({ complaint, updates, isSubscribed = false }: StatusTimelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timelineSteps, setTimelineSteps] = useState<any[]>([]);

  // Transform updates into timeline steps
  useEffect(() => {
    if (!complaint || !updates) return;

    // Get all unique statuses in chronological order
    const statusUpdates = [...updates].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Create timeline steps
    const steps = statusOrder.map((status) => {
      const update = statusUpdates.find((u) => u.new_status === status);
      const config = statusConfig[status as keyof typeof statusConfig];
      
      return {
        status,
        label: config?.label || status,
        icon: config?.icon || AlertCircle,
        color: config?.color || 'text-slate-600',
        bgColor: config?.bgColor || 'bg-slate-100',
        description: config?.description || '',
        date: update?.created_at,
        note: update?.note,
        changedBy: update?.changed_by_role || update?.changed_by,
        isCompleted: statusUpdates.some((u) => u.new_status === status),
        isCurrent: complaint.status === status,
      };
    }).filter(step => step.isCompleted || step.isCurrent);

    setTimelineSteps(steps);
    
    // Find current step index
    const currentIndex = steps.findIndex(step => step.isCurrent);
    setCurrentStep(currentIndex !== -1 ? currentIndex : steps.length - 1);
  }, [complaint, updates]);

  // Calculate progress percentage
  const progressPercentage = timelineSteps.length > 0 
    ? ((currentStep + 1) / timelineSteps.length) * 100 
    : 0;

  if (!complaint) {
    return null;
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
            <CardDescription>
              Track the progress of your complaint
            </CardDescription>
          </div>
          {isSubscribed && (
            <Badge variant="outline" className="animate-pulse">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              Live Updates
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {timelineSteps.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No status updates yet
            </h3>
            <p className="text-slate-600">
              Your complaint has been submitted and is awaiting processing.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {/* Timeline steps */}
            <div className="space-y-8">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === timelineSteps.length - 1;
                
                return (
                  <div key={step.status} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`
                        h-12 w-12 rounded-full border-4 border-white flex items-center justify-center
                        ${step.isCurrent 
                          ? 'animate-pulse bg-blue-500' 
                          : step.isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-slate-200'
                        }
                      `}>
                        <Icon className={`
                          h-6 w-6 
                          ${step.isCurrent ? 'text-white' : 
                            step.isCompleted ? 'text-white' : 'text-slate-400'
                          }
                        `} />
                      </div>
                      
                      {/* Pulsing ring for current step */}
                      {step.isCurrent && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 pb-8 ${!isLast ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">
                              {step.label}
                            </h4>
                            {step.isCurrent && (
                              <Badge variant="default" className="animate-pulse">
                                Current
                              </Badge>
                            )}
                            {step.isCompleted && !step.isCurrent && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {step.description}
                          </p>
                        </div>
                        
                        {step.date && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(step.date), 'MMM dd, yyyy')}
                            <span className="text-slate-400">•</span>
                            {format(new Date(step.date), 'hh:mm a')}
                          </div>
                        )}
                      </div>
                      
                      {/* Note and actor */}
                      {(step.note || step.changedBy) && (
                        <div className="bg-slate-50 rounded-lg p-4 mt-3">
                          {step.note && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5" />
                              <p className="text-sm text-slate-700">{step.note}</p>
                            </div>
                          )}
                          
                          {step.changedBy && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <User className="h-4 w-4" />
                              <span>Updated by: {step.changedBy}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Estimated next steps */}
        {timelineSteps.length > 0 && complaint.status !== 'closed' && complaint.status !== 'rejected' && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">What's Next?</h4>
              {complaint.status === 'received' && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700">
                      Your complaint will be reviewed within 24 hours. You'll receive a notification when it's assigned.
                    </p>
                  </div>
                </div>
              )}
              {complaint.status === 'assigned' && (
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700">
                      The assigned department will start working on your complaint soon.
                      Check the assignment card for contact details.
                    </p>
                  </div>
                </div>
              )}
              {complaint.status === 'in_progress' && (
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700">
                      Work is in progress. You can check staff updates for the latest progress.
                    </p>
                  </div>
                </div>
              )}
              {complaint.status === 'resolved' && (
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700">
                      The issue has been resolved. Please provide feedback to help us improve our services.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}