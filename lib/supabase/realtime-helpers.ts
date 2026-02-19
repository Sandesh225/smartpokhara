import { SupabaseClient } from "@supabase/supabase-js";

export const subscribeToUserNotices = (options: {
  onNewNotice: (notice: any) => void;
  onError?: (error: any) => void;
}) => {
  // Mock or basic implementation until full logic is available
  console.log("Subscribing to notices...");
  return { unsubscribe: () => {} } as any;
};

export const subscribeToUserBills = (options: {
  onNewBill: (bill: any) => void;
  onBillUpdate?: (bill: any) => void;
  onError?: (error: any) => void;
}) => {
  console.log("Subscribing to bills...");
  return { unsubscribe: () => {} } as any;
};

export const subscribeToUserPayments = (options: {
  onNewPayment: (payment: any) => void;
  onError?: (error: any) => void;
}) => {
  console.log("Subscribing to payments...");
  return { unsubscribe: () => {} } as any;
};
