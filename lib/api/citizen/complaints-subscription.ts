// lib/realtime/complaints-subscription.ts - COMPLETE REAL-TIME SYSTEM
"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SubscriptionCallbacks {
  onComplaintUpdate?: (complaint: any) => void;
  onStatusChange?: (statusHistory: any) => void;
  onNewComment?: (comment: any) => void;
  onAttachmentAdded?: (attachment: any) => void;
  onError?: (error: Error) => void;
}

export class ComplaintRealtimeManager {
  private supabase = createClient();
  private channels: Map<string, any> = new Map();
  private userId: string | null = null;

  constructor() {
    this.initializeUser();
  }

  private async initializeUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  /**
   * Subscribe to all complaints for current user
   */
  subscribeToUserComplaints(callbacks: SubscriptionCallbacks) {
    if (!this.userId) {
      console.warn("No user ID available for subscription");
      return () => {};
    }

    const channelId = `user-complaints-${this.userId}`;
    
    if (this.channels.has(channelId)) {
      this.channels.get(channelId).unsubscribe();
    }

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `citizen_id=eq.${this.userId}`,
        },
        (payload) => {
          this.handleComplaintChange(payload, callbacks);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user complaints');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error');
          callbacks.onError?.(new Error('Subscription failed'));
        }
      });

    this.channels.set(channelId, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelId);
    };
  }

  /**
   * Subscribe to a single complaint with all related data
   */
  subscribeToComplaint(complaintId: string, callbacks: SubscriptionCallbacks) {
    const channelId = `complaint-${complaintId}`;
    
    if (this.channels.has(channelId)) {
      this.channels.get(channelId).unsubscribe();
    }

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaintId}`,
        },
        (payload) => {
          this.handleComplaintChange(payload, callbacks);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_status_history',
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          this.handleStatusChange(payload, callbacks);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_comments',
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          this.handleCommentChange(payload, callbacks);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_attachments',
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          this.handleAttachmentChange(payload, callbacks);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to complaint ${complaintId}`);
        }
      });

    this.channels.set(channelId, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelId);
    };
  }

  private handleComplaintChange(payload: any, callbacks: SubscriptionCallbacks) {
    const { eventType, new: newData, old: oldData } = payload;
    
    console.log('Complaint change:', eventType, newData);

    callbacks.onComplaintUpdate?.(newData);

    // Show toast notifications for important changes
    if (eventType === 'UPDATE') {
      if (newData.status !== oldData?.status) {
        this.showStatusNotification(newData);
      }
      
      if (newData.priority !== oldData?.priority && newData.priority === 'urgent') {
        toast.warning("Your complaint has been marked as urgent", {
          description: "We're prioritizing this issue.",
        });
      }
    }
  }

  private handleStatusChange(payload: any, callbacks: SubscriptionCallbacks) {
    const { eventType, new: newData } = payload;
    
    if (eventType === 'INSERT') {
      callbacks.onStatusChange?.(newData);
      
      // Show notification for new status updates
      if (newData.new_status === 'resolved') {
        toast.success("Your complaint has been resolved!", {
          description: "Please provide feedback on your experience.",
          action: {
            label: "View",
            onClick: () => window.location.href = `/citizen/complaints/${newData.complaint_id}`,
          },
        });
      } else if (newData.new_status === 'in_progress') {
        toast.info("Your complaint is now in progress", {
          description: "Our team is working on it.",
        });
      }
    }
  }

  private handleCommentChange(payload: any, callbacks: SubscriptionCallbacks) {
    const { eventType, new: newData } = payload;
    
    if (eventType === 'INSERT' && newData.user_role === 'staff') {
      callbacks.onNewComment?.(newData);
      
      // Show notification for staff comments
      toast.info("New message from staff", {
        description: newData.comment_text.substring(0, 100) + "...",
        action: {
          label: "View",
          onClick: () => window.location.href = `/citizen/complaints/${newData.complaint_id}#comments`,
        },
      });
    }
  }

  private handleAttachmentChange(payload: any, callbacks: SubscriptionCallbacks) {
    const { eventType, new: newData } = payload;
    
    if (eventType === 'INSERT') {
      callbacks.onAttachmentAdded?.(newData);
    }
  }

  private showStatusNotification(complaint: any) {
    const statusMessages: Record<string, { title: string; description: string }> = {
      assigned: {
        title: "Complaint Assigned",
        description: "Your complaint has been assigned to a staff member.",
      },
      in_progress: {
        title: "Work in Progress",
        description: "Our team is now working on your complaint.",
      },
      resolved: {
        title: "Complaint Resolved",
        description: "Your complaint has been resolved!",
      },
      closed: {
        title: "Complaint Closed",
        description: "Your complaint has been closed.",
      },
      rejected: {
        title: "Complaint Review",
        description: "Your complaint requires additional information.",
      },
    };

    const message = statusMessages[complaint.status];
    if (message) {
      toast(message.title, {
        description: message.description,
        action: {
          label: "View",
          onClick: () => window.location.href = `/citizen/complaints/${complaint.id}`,
        },
      });
    }
  }

  /**
   * Check connection status
   */
  getConnectionStatus() {
    let connected = false;
    this.channels.forEach(channel => {
      if (channel.state === 'joined') {
        connected = true;
      }
    });
    return connected;
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

// Singleton instance
let realtimeManager: ComplaintRealtimeManager | null = null;

export function getRealtimeManager(): ComplaintRealtimeManager {
  if (!realtimeManager) {
    realtimeManager = new ComplaintRealtimeManager();
  }
  return realtimeManager;
}