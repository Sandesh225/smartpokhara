'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  subscribeToUserNotices, 
  subscribeToUserBills, 
  subscribeToUserPayments 
} from '@/lib/supabase/realtime-helpers';

import { RealtimeChannel } from '@supabase/supabase-js';
import { Bell, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function RealTimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingBills, setPendingBills] = useState(0);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  useEffect(() => {
    const initSubscriptions = async () => {
      try {
        // Subscribe to notices
        const noticesChannel = subscribeToUserNotices({
          onNewNotice: (notice) => {
            setUnreadCount(prev => prev + 1);
            toast.success('New Notice', {
              description: notice.title,
              action: {
                label: 'View',
                onClick: () => window.location.href = `/citizen/notices/${notice.id}`
              }
            });
          },
          onError: (error) => {
            console.error('Notices subscription error:', error);
          }
        });

        // Subscribe to bills
        const billsChannel = subscribeToUserBills({
          onNewBill: (bill) => {
            if (bill.status === 'pending') {
              setPendingBills(prev => prev + 1);
              toast.warning('New Bill Generated', {
                description: `${bill.bill_type} - NPR ${bill.total_amount}`,
                action: {
                  label: 'Pay Now',
                  onClick: () => window.location.href = `/citizen/payments`
                }
              });
            }
          },
          onBillUpdate: (bill) => {
            if (bill.status === 'completed') {
              setPendingBills(prev => Math.max(0, prev - 1));
              toast.success('Bill Paid', {
                description: `Payment completed for ${bill.bill_number}`
              });
            }
          },
          onError: (error) => {
            console.error('Bills subscription error:', error);
          }
        });

        // Subscribe to payments
        const paymentsChannel = subscribeToUserPayments({
          onNewPayment: (payment) => {
            if (payment.status === 'completed') {
              toast.success('Payment Successful', {
                description: `Receipt: ${payment.receipt_number}`,
                action: {
                  label: 'View Receipt',
                  onClick: () => window.location.href = `/citizen/payments/receipt?payment=${payment.id}`
                }
              });
            }
          },
          onError: (error) => {
            console.error('Payments subscription error:', error);
          }
        });

        setChannels([noticesChannel, billsChannel, paymentsChannel]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing subscriptions:', error);
      }
    };

    initSubscriptions();

    return () => {
      channels.forEach(channel => {
        channel?.unsubscribe();
      });
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>

        {/* Notifications */}
        {(unreadCount > 0 || pendingBills > 0) && (
          <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2 min-w-[200px]">
            {unreadCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">New notices</span>
                </div>
                <Badge variant="default">{unreadCount}</Badge>
              </div>
            )}
            {pendingBills > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm">Pending bills</span>
                </div>
                <Badge variant="destructive">{pendingBills}</Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}