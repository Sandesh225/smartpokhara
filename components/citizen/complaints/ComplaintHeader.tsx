// components/citizen/complaints/ComplaintHeader.tsx
'use client';

import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Complaint } from '@/lib/supabase/queries/complaints';

interface ComplaintHeaderProps {
  complaint: Complaint;
  onBack?: () => void;
}

const statusConfig = {
  received: { label: 'Received', variant: 'secondary' as const, icon: Clock },
  under_review: { label: 'Under Review', variant: 'secondary' as const, icon: AlertCircle },
  assigned: { label: 'Assigned', variant: 'secondary' as const, icon: AlertCircle },
  in_progress: { label: 'In Progress', variant: 'secondary' as const, icon: RefreshCw },
  resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle },
  closed: { label: 'Closed', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  reopened: { label: 'Reopened', variant: 'outline' as const, icon: RefreshCw },
};

const priorityConfig = {
  critical: { label: 'Critical', variant: 'destructive' as const },
  urgent: { label: 'Urgent', variant: 'destructive' as const },
  high: { label: 'High', variant: 'destructive' as const },
  medium: { label: 'Medium', variant: 'secondary' as const },
  low: { label: 'Low', variant: 'outline' as const },
};

export function ComplaintHeader({ complaint, onBack }: ComplaintHeaderProps) {
  const status = statusConfig[complaint.status];
  const priority = priorityConfig[complaint.priority];
  const StatusIcon = status.icon;

  const handlePrint = () => {
    const printWindow = window.open(`/complaints/${complaint.id}/print`, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: complaint.title,
      text: `Complaint: ${complaint.title}\nTracking Code: ${complaint.tracking_code}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleCopyTrackingCode = async () => {
    await navigator.clipboard.writeText(complaint.tracking_code);
    toast.success('Tracking code copied to clipboard');
  };

  const handleDownloadDetails = () => {
    // Generate and download PDF or text file
    const element = document.createElement('a');
    const content = `
Complaint Details
=================
Tracking Code: ${complaint.tracking_code}
Title: ${complaint.title}
Status: ${status.label}
Priority: ${priority.label}
Category: ${complaint.category?.name || 'N/A'}
Subcategory: ${complaint.subcategory?.name || 'N/A'}
Ward: Ward ${complaint.ward?.ward_number || 'N/A'} - ${complaint.ward?.name || 'N/A'}
Submitted: ${format(new Date(complaint.submitted_at), 'MMM dd, yyyy HH:mm')}
Last Updated: ${format(new Date(complaint.updated_at), 'MMM dd, yyyy HH:mm')}
Description:
${complaint.description}
    `;
    
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `complaint-${complaint.tracking_code}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Details downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-sm text-slate-500">
            Complaint Details
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTrackingCode}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Tracking Code
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share via Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyTrackingCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Tracking Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadDetails}>
                <Download className="h-4 w-4 mr-2" />
                Download Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Print</span>
          </Button>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4">
            {/* Title and Status */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {complaint.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={status.variant} className="gap-2 px-3 py-1">
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </Badge>
                    <Badge variant={priority.variant}>
                      {priority.label} Priority
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-slate-900">
                    {complaint.tracking_code}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Tracking Code
                  </div>
                </div>
              </div>
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    {complaint.category?.icon && (
                      <span>{complaint.category.icon}</span>
                    )}
                    {complaint.category?.name || 'N/A'}
                  </Badge>
                  {complaint.subcategory && (
                    <Badge variant="outline">
                      {complaint.subcategory.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Ward {complaint.ward?.ward_number || 'N/A'} - {complaint.ward?.name || 'N/A'}
                  </Badge>
                  {complaint.address_text && (
                    <span className="text-sm text-slate-700">
                      {complaint.address_text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Submitted</span>
                </div>
                <div className="text-sm text-slate-900">
                  {format(new Date(complaint.submitted_at), 'MMM dd, yyyy')}
                  <span className="text-slate-500 ml-2">
                    at {format(new Date(complaint.submitted_at), 'hh:mm a')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <div className="text-sm text-slate-900">
                  {format(new Date(complaint.updated_at), 'MMM dd, yyyy')}
                  <span className="text-slate-500 ml-2">
                    at {format(new Date(complaint.updated_at), 'hh:mm a')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Information (if applicable) */}
          {complaint.sla_due_at && (
            <div className="lg:w-64">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">SLA Deadline</span>
                    <Badge variant={
                      new Date() > new Date(complaint.sla_due_at) 
                        ? 'destructive' 
                        : 'outline'
                    }>
                      {new Date() > new Date(complaint.sla_due_at) 
                        ? 'Overdue' 
                        : 'Active'}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {format(new Date(complaint.sla_due_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-slate-600">
                    {Math.ceil(
                      (new Date(complaint.sla_due_at).getTime() - new Date().getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days remaining
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
